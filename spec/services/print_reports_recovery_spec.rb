require "rails_helper"
require "sidekiq/testing"

RSpec.describe PrintReports::Recovery do
  let(:application) { create(:permit_application) }
  let(:version) do
    create(
      :submission_version,
      :with_report_snapshot,
      permit_application: application
    )
  end
  let(:pdf) do
    Rails.root.join("spec/support/Test Document Seal - unsigned.pdf").to_s
  end
  before do
    Sidekiq::Testing.fake!
    allow_any_instance_of(VirusScanService).to receive(:scan!).and_return(true)
    allow_any_instance_of(PrintReports::Renderer).to receive(:render).and_yield(
      pdf
    )
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
  end

  it "recreates deleted records/files from the snapshot and is idempotent" do
    described_class.call(version)
    saved = version.reload.report_snapshot
    old = version.supporting_documents.first
    old.file.delete
    old.destroy!
    application.permit_project.update!(full_address: "Changed after submission")
    expect_any_instance_of(PrintReports::Renderer).to receive(
      :render
    ) do |_, report, **_options, &block|
      expect(report[:identity][:address]).to eq(
        saved.dig("reports", "application", "identity", "address")
      )
      block.call(pdf)
    end
    results = described_class.call(version)
    expect(results).to include(include(kind: "application", status: "restored"))
    expect(version.supporting_documents.count).to eq(1)
    expect(version.supporting_documents.first.id).not_to eq(old.id)
    expect(described_class.call(version)).to contain_exactly(
      { kind: "application", status: "reused" },
      { kind: "zip", submission_version_id: version.id, status: "restored" }
    )
  end

  it "rebuilds the selected and later ZIPs on retry after PDF repair and partial ZIP publication" do
    earlier =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application
      )
    described_class.call(earlier)
    described_class.call(version)
    later =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application
      )
    described_class.call(later)
    versions = [earlier, version, later]
    old_zips = versions.map { |entry| entry.reload.zipfile_data }
    doc = version.supporting_documents.first
    doc.file.delete

    allow(SupportingDocumentsZipper).to receive(
      :new
    ).and_wrap_original do |original, *args, **kwargs|
      if kwargs[:submission_version].id == later.id
        raise IOError, "Interrupted ZIP rebuild"
      end
      original.call(*args, **kwargs)
    end
    expect { described_class.call(version) }.to raise_error(
      IOError,
      "Interrupted ZIP rebuild"
    )
    expect(PrintReports::StoredFile.valid_pdf?(doc.reload.file)).to be true
    expect(version.reload.zipfile_data).not_to eq(old_zips[1])
    expect(later.reload.zipfile_data).to eq(old_zips[2])
    expect(PrintReports::StoredFile.valid_zip?(later.zipfile)).to be true
    repaired_file = doc.file_data
    first_rebuilt_zip = version.zipfile_data

    allow(SupportingDocumentsZipper).to receive(:new).and_call_original
    result = described_class.call(version)
    expect(result).to contain_exactly(
      { kind: "application", status: "reused" },
      { kind: "zip", submission_version_id: version.id, status: "restored" },
      { kind: "zip", submission_version_id: later.id, status: "restored" }
    )
    expect(earlier.reload.zipfile_data).to eq(old_zips[0])
    expect(version.reload.zipfile_data).not_to eq(first_rebuilt_zip)
    expect(later.reload.zipfile_data).not_to eq(old_zips[2])
    expect(doc.reload.file_data).to eq(repaired_file)
    later.zipfile.download do |file|
      Zip::File.open(file.path) { |zip| expect(zip.entries.length).to eq(3) }
    end
  end

  it "repairs object-only loss and rebuilds later cumulative packages without new readiness webhooks" do
    described_class.call(version)
    later =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application
      )
    described_class.call(later)
    version.update!(package_ready_at: 1.day.ago)
    ready = version.reload.package_ready_at
    old_zip = later.reload.zipfile_data["id"]
    doc = version.supporting_documents.first
    doc.file.delete
    PermitWebhookJob.clear
    result = described_class.call(version)
    expect(doc.reload.file.exists?).to be true
    expect(result).to include(
      include(kind: "zip", submission_version_id: later.id, status: "restored")
    )
    expect(later.reload.zipfile_data["id"]).not_to eq(old_zip)
    expect(version.reload.package_ready_at).to eq(ready)
    expect(PermitWebhookJob.jobs).to be_empty
    later.zipfile.open do |file|
      Zip::File.open(file.path) { |zip| expect(zip.entries.length).to eq(2) }
    end
  end

  it "continues newer PDF generation when missing historical reports block cumulative ZIPs" do
    historical = create(:submission_version, permit_application: application)
    result = described_class.call(version)
    expect(version.supporting_documents.count).to eq(1)
    expect(version.reload.zipfile_data).to be_blank
    expect(result).to include(
      include(kind: "zip", status: "blocked", reason: include(historical.id))
    )
    expect(described_class.call(historical)).to include(
      include(kind: "application", status: "blocked")
    )
    expect(historical.supporting_documents).to be_empty
  end

  it "does not interpret storage errors as permission to replace reports" do
    described_class.call(version)
    id = version.supporting_documents.first.file_data["id"]
    allow(PrintReports::StoredFile).to receive(:valid_pdf?).and_raise(
      IOError,
      "storage unavailable"
    )
    expect { described_class.call(version) }.to raise_error(IOError)
    expect(version.supporting_documents.first.file_data["id"]).to eq(id)
  end

  it "keeps existing legacy PDFs usable without a snapshot" do
    legacy = create(:submission_version, permit_application: application)
    File.open(pdf, "rb") do |file|
      legacy.supporting_documents.create!(
        permit_application: application,
        data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY,
        file: file
      )
    end
    result = described_class.call(legacy)
    expect(result).to include(include(kind: "application", status: "reused"))
    expect(legacy.reload.zipfile_data).to be_present
  end
  it "replaces corrupt PDF and ZIP content without changing the snapshot" do
    described_class.call(version)
    snapshot = version.reload.report_snapshot
    doc = version.supporting_documents.first
    doc.file.open do |file|
      # Overwrite the storage object while preserving its database reference.
      doc.file.storage.upload(StringIO.new("broken PDF"), doc.file.id)
    end
    version.zipfile.storage.upload(
      StringIO.new("broken ZIP"),
      version.zipfile.id
    )
    result = described_class.call(version)
    expect(result).to include(
      include(kind: "application", status: "restored"),
      include(kind: "zip", status: "restored")
    )
    expect(PrintReports::StoredFile.valid_pdf?(doc.reload.file)).to be true
    expect(
      PrintReports::StoredFile.valid_zip?(version.reload.zipfile)
    ).to be true
    expect(version.report_snapshot).to eq(snapshot)
  end

  it "retains uploaded file membership from the snapshot when legacy answers change" do
    upload =
      File.open(pdf, "rb") do |file|
        application.supporting_documents.create!(
          permit_application: application,
          data_key: "drawing_file",
          file: file
        )
      end
    saved =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application,
        submission_data: {
          "data" => {
            "drawing_file" => [{ "model_id" => upload.id }]
          }
        }
      )
    saved.update!(submission_data: { "data" => {} })
    result = described_class.call(saved)
    expect(result).to include(include(kind: "zip", status: "restored"))
    saved.reload.zipfile.open do |file|
      Zip::File.open(file.path) { |zip| expect(zip.entries.length).to eq(2) }
    end
    upload.reload.file.delete
    saved.zipfile.delete
    result = described_class.call(saved)
    expect(result).to include(
      include(kind: "zip", status: "blocked", reason: include(upload.id))
    )
  end

  it "does not publish a ZIP when an original upload was deleted" do
    saved =
      create(
        :submission_version,
        :with_report_snapshot,
        permit_application: application,
        submission_data: {
          "data" => {
            "supporting_file" => [{ "modelId" => SecureRandom.uuid }]
          }
        }
      )
    result = described_class.call(saved)
    expect(result).to include(
      include(
        kind: "zip",
        status: "blocked",
        reason: "Required supporting documents are unavailable"
      )
    )
    expect(saved.reload.zipfile_data).to be_blank
    expect(saved.supporting_documents.count).to eq(1)
  end

  it "generates later PDFs without retrying permanently unavailable historical versions" do
    historical = create(:submission_version, permit_application: application)
    version
    application.update_column(
      :status,
      PermitApplication.statuses[:newly_submitted]
    )
    expect { ZipfileJob.new.perform(application.id) }.not_to raise_error
    expect(version.supporting_documents.count).to eq(1)
    expect(version.reload.zipfile_data).to be_blank
    expect(application.report_generation_issues).to include(
      include(submission_version_id: historical.id)
    )
  end

  it "coordinates separate connections with the generation lock" do
    key = Digest::SHA256.digest("print-reports:#{application.id}").unpack1("q>")
    PrintReports::ApplicationLock.synchronize(application.id) do
      acquired =
        Thread
          .new do
            ActiveRecord::Base.connection_pool.with_connection do |connection|
              connection.select_value("SELECT pg_try_advisory_lock(#{key})")
            end
          end
          .value
      expect(acquired).to be false
    end
    acquired =
      Thread
        .new do
          ActiveRecord::Base.connection_pool.with_connection do |connection|
            result =
              connection.select_value("SELECT pg_try_advisory_lock(#{key})")
            connection.execute("SELECT pg_advisory_unlock(#{key})") if result
            result
          end
        end
        .value
    expect(acquired).to be true
  end

  %w[application part3 part9].each do |kind|
    it "preserves real #{kind} PDF contents after deleting rows and files",
       if: ENV["RUN_GOTENBERG_SPECS"] == "true" do
      allow_any_instance_of(PrintReports::Renderer).to receive(
        :render
      ).and_call_original
      checklist = nil
      if kind != "application"
        fixture_name = kind == "part3" ? "part3-mixed" : "part9-populated"
        fixture =
          JSON.parse(
            File.read(
              Rails.root.join(
                "app/frontend/components/print/__tests__/fixtures/#{fixture_name}.json"
              )
            )
          )
        checklist =
          fixture.fetch("checklist").merge(
            "step_code_type" =>
              kind == "part3" ? "Part3StepCode" : "Part9StepCode"
          )
        step = create(kind == "part3" ? :part_3_step_code : :part_9_step_code)
        step.update_column(:permit_application_id, application.id)
        application.reload
      end
      saved =
        create(
          :submission_version,
          :with_report_snapshot,
          permit_application: application,
          step_code_checklist_json: checklist,
          form_json: {
            "components" => [
              {
                "type" => "textfield",
                "input" => true,
                "key" => "answer",
                "label" => "Original question"
              },
              {
                "type" => "checkbox",
                "input" => true,
                "key" => "false_answer",
                "label" => "Original boolean"
              },
              {
                "type" => "number",
                "input" => true,
                "key" => "zero",
                "label" => "Original number"
              }
            ]
          },
          submission_data: {
            "data" => {
              "answer" => "Original answer",
              "false_answer" => false,
              "zero" => 0
            }
          }
        )
      read_text =
        lambda do
          saved
            .supporting_documents
            .order(:data_key)
            .map do |doc|
              doc.file.open do |file|
                PDF::Reader.new(file.path).pages.map(&:text).join("\n")
              end
            end
        end
      VCR.turned_off do
        described_class.call(saved)
        before = read_text.call
        saved.supporting_documents.each do |doc|
          doc.file.delete
          doc.destroy!
        end
        saved.update!(
          submission_data: {
            "data" => {
              "answer" => "Later answer"
            }
          },
          form_json: {
            "components" => []
          }
        )
        application.permit_project.update!(full_address: "Changed address")
        described_class.call(saved)
        expect(read_text.call).to eq(before)
        expect(read_text.call.join).to include(
          "Original question",
          "Original answer",
          "Original boolean",
          "Original number"
        )
        expect(read_text.call.join).not_to include(
          "Later answer",
          "Changed address"
        )
        saved.supporting_documents.each do |doc|
          doc.file.open do |file|
            FileUtils.mkdir_p(
              Rails.root.join("tmp/codex-planning/snapshot-recovery")
            )
            FileUtils.cp(
              file.path,
              Rails.root.join(
                "tmp/codex-planning/snapshot-recovery/#{kind}-#{doc.data_key}.pdf"
              )
            )
          end
        end
      end
    end
  end
end
