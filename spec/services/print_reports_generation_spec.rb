require "rails_helper"
require "sidekiq/testing"

RSpec.describe PrintReports::Generation do
  let(:application) { create(:permit_application) }
  let(:version) do
    create(
      :submission_version,
      :with_report_snapshot,
      permit_application: application,
      form_json: {
        "components" => [
          {
            "type" => "textfield",
            "key" => "raw_answer",
            "label" => "Question"
          }
        ]
      },
      submission_data: {
        "data" => {
          "raw_answer" => "Original"
        }
      }
    )
  end
  let(:pdf) do
    Rails.root.join("spec/support/Test Document Seal - unsigned.pdf").to_s
  end

  before do
    Sidekiq::Testing.fake!
    allow_any_instance_of(VirusScanService).to receive(:scan!).and_return(true)
    allow(ENV).to receive(:fetch).and_call_original
    allow_any_instance_of(PrintReports::Renderer).to receive(:render).and_yield(
      pdf
    )
  end

  it "uses saved schema and raw answers with a complete server context" do
    report =
      PrintReports::Data.for_generation.application(application, version.id)
    expect(report[:submission_data]).to eq(
      "data" => {
        "raw_answer" => "Original"
      }
    )
    expect(report[:form_json]["components"].first["key"]).to eq("raw_answer")
    expect {
      PrintReports::Data.for_generation.application(application)
    }.to raise_error(ArgumentError)
  end

  it "persists and promotes one document, reusing it on retry" do
    generator = described_class.new
    2.times { generator.submission(version) }
    docs =
      version.supporting_documents.where(
        data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY
      )
    expect(docs.count).to eq(1)
    expect(docs.first.file_data["storage"]).to eq("store")
    expect(docs.first.file.exists?).to be true
  end

  it "does not attach output when rendering fails" do
    allow_any_instance_of(PrintReports::Renderer).to receive(:render).and_raise(
      PrintReports::Renderer::Error,
      "timeout"
    )
    expect { described_class.new.submission(version) }.to raise_error(
      PrintReports::Renderer::Error
    )
    expect(version.supporting_documents).to be_empty
  end

  %w[part3 part9].each do |kind|
    it "attaches the saved #{kind} checklist without requiring a current step code" do
      fixture =
        JSON.parse(
          File.read(
            Rails.root.join(
              "app/frontend/components/print/__tests__/fixtures/#{kind}.json"
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
      saved =
        create(
          :submission_version,
          :with_report_snapshot,
          permit_application: application,
          step_code_checklist_json: checklist
        )
      application.step_code.update_column(:permit_application_id, nil)
      application.reload
      expect(application.step_code).to be_nil
      described_class.new.submission(saved)
      expect(saved.supporting_documents.pluck(:data_key)).to contain_exactly(
        SupportingDocument::APPLICATION_PDF_DATA_KEY,
        SupportingDocument::CHECKLIST_PDF_DATA_KEY
      )
    end
  end

  it "builds a complete version-owned ZIP and marks it ready only after publication" do
    application.update_column(
      :status,
      PermitApplication.statuses[:newly_submitted]
    )
    expect(version.package_ready_at).to be_nil
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return({})
    ZipfileJob.new.perform(application.id)
    version.reload
    expect(version.package_ready_at).to be_present
    expect(version.zipfile_data["storage"]).to eq("store")
    version.zipfile.open do |file|
      Zip::File.open(file.path) do |zip|
        expect(zip.entries.size).to eq(1)
        expect(zip.entries.first.name).to include("permit-application_v1.pdf")
      end
    end
  end

  it "freezes ZIP membership and upload target if another submission arrives" do
    described_class.new.submission(version)
    zipper =
      SupportingDocumentsZipper.new(
        application.id,
        submission_version: version,
        version_ids: [version.id]
      )
    later = create(:submission_version, permit_application: application)
    zipper.perform
    expect(version.reload.zipfile_data).to be_present
    expect(later.reload.zipfile_data).to be_blank
  end

  it "routes the existing PDF job through the configured renderer" do
    expect_any_instance_of(described_class).to receive(:submission).with(
      version
    )
    PdfGenerationJob.new.perform(application.id, [version.id])
  end

  it "renders, promotes and notifies for an explicitly selected standalone checklist" do
    step_code = create(:part_9_step_code)
    checklist = step_code.current_checklist
    allow(NotificationService).to receive(
      :publish_step_code_report_generated_event
    )
    described_class.new.step_code(
      step_code,
      checklist,
      filename: "standalone.pdf"
    )
    doc = checklist.reload.report_document
    expect(doc.step_code_id).to eq(step_code.id)
    expect(doc.file_data["storage"]).to eq("store")
    expect(doc.stale).to be false
    expect(NotificationService).to have_received(
      :publish_step_code_report_generated_event
    ).with(doc)
  end

  it "does not publish a standalone result after its source changes" do
    step_code = create(:part_9_step_code)
    checklist = step_code.current_checklist
    allow_any_instance_of(PrintReports::Renderer).to receive(
      :render
    ) do |_, _report, **_options, &block|
      step_code.update_column(:title, "Edited while rendering")
      block.call(pdf)
    end
    expect {
      described_class.new.step_code(step_code, checklist, filename: "stale.pdf")
    }.to raise_error(PrintReports::Renderer::Error, /changed/)
    expect(checklist.reload.report_document).to be_nil
  end

  it "runs real conversion through attachments and the ZIP job",
     if: ENV["RUN_GOTENBERG_SPECS"] == "true" do
    allow_any_instance_of(PrintReports::Renderer).to receive(
      :render
    ).and_call_original
    allow(ENV).to receive(:fetch).with("GOTENBERG_URL", anything).and_return(
      "http://127.0.0.1:13000"
    )
    application.update_column(
      :status,
      PermitApplication.statuses[:newly_submitted]
    )
    version
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return({})
    VCR.turned_off { ZipfileJob.new.perform(application.id) }
    version.reload
    expect(version.package_ready_at).to be_present
    version.zipfile.open do |file|
      Zip::File.open(file.path) do |zip|
        expect(zip.entries.size).to eq(1)
        bytes = zip.entries.first.get_input_stream.read
        expect(
          PDF::Reader.new(StringIO.new(bytes)).pages.map(&:text).join
        ).to include("Original")
      end
    end
  end
end
