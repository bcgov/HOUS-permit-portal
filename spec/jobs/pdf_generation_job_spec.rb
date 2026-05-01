require "rails_helper"
require "sidekiq/testing"

RSpec.describe PdfGenerationJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "locks by permit_application_id" do
    expect(described_class.lock_args(%w[pa1 other])).to eq(["pa1"])
  end

  describe "#camelize_key" do
    it "preserves special keys and camelizes standard snake_case keys" do
      job = described_class.new

      expect(job.camelize_key("section-completion-key")).to eq(
        "section-completion-key"
      )
      expect(job.camelize_key("formSubmissionDataFoo")).to eq(
        "formSubmissionDataFoo"
      )
      expect(job.camelize_key("a_b_c")).to eq("aBC")

      section_uuid = "section123e4567-e89b-12d3-a456-426614174000"
      expect(job.camelize_key(section_uuid)).to eq(section_uuid)
    end
  end

  it "generates and attaches PDFs when renderer succeeds" do
    permit_application =
      instance_double("PermitApplication", id: "pa1", number: "DSQ-001-000-057")
    allow(PermitApplication).to receive(:find).with("pa1").and_return(
      permit_application
    )

    submission_version =
      instance_double(
        "SubmissionVersion",
        id: "sv1",
        version_number: 1,
        missing_pdfs?: true,
        missing_permit_application_pdf?: true,
        missing_step_code_checklist_pdf?: true,
        form_json: {
        },
        formatted_submission_data: {
        },
        created_at: Time.zone.local(2026, 4, 29),
        has_step_code_checklist?: true,
        step_code_checklist_json: {
        },
        supporting_documents: double("SupportingDocs"),
        permit_application_id: "pa1"
      )
    allow(permit_application).to receive(:submission_versions).and_return(
      [submission_version]
    )

    allow(PermitApplicationBlueprint).to receive(:render_as_json).and_return({})
    allow_any_instance_of(described_class).to receive(
      :camelize_response
    ).and_return({})

    docs_rel = submission_version.supporting_documents
    where_rel = double("WhereRel")
    doc = instance_double("SupportingDocument", file: nil, update: true)
    allow(docs_rel).to receive(:where).and_return(where_rel)
    allow(where_rel).to receive(:first_or_initialize).and_return(doc)

    exit_status = instance_double(Process::Status, success?: true, to_s: "0")

    allow(Open3).to receive(
      :popen3
    ) do |_a, _b, _c, json_filename, chdir:, &popen_block|
      # Create the files the job expects to attach.
      data = JSON.parse(File.read(json_filename))
      paths = data.fetch("meta").fetch("generationPaths")
      expect(paths.fetch("permitApplication")).to end_with(
        "DSQ-001-000-057_2026-04-29_permit-application_v1.pdf"
      )
      expect(paths.fetch("stepCodeChecklist")).to end_with(
        "DSQ-001-000-057_2026-04-29_step-code-checklist_v1.pdf"
      )
      paths.values.compact.each do |path|
        FileUtils.mkdir_p(File.dirname(path))
        File.write(path, "%PDF-1.4")
      end

      stdin = StringIO.new
      stdout = StringIO.new
      stderr = StringIO.new
      wait_thr = instance_double("WaitThread", value: exit_status)
      popen_block.call(stdin, stdout, stderr, wait_thr)
      ["", "", exit_status]
    end

    described_class.new.perform("pa1")

    expect(doc).to have_received(:update).at_least(:once)
  end

  it "raises and cleans up when renderer fails" do
    permit_application =
      instance_double("PermitApplication", id: "pa1", number: "DSQ-001-000-057")
    allow(PermitApplication).to receive(:find).with("pa1").and_return(
      permit_application
    )

    submission_version =
      instance_double(
        "SubmissionVersion",
        id: "sv1",
        version_number: 1,
        missing_pdfs?: true,
        missing_permit_application_pdf?: true,
        missing_step_code_checklist_pdf?: false,
        form_json: {
        },
        formatted_submission_data: {
        },
        created_at: Time.current,
        has_step_code_checklist?: false,
        step_code_checklist_json: {
        },
        supporting_documents: double("SupportingDocs"),
        permit_application_id: "pa1"
      )
    allow(permit_application).to receive(:submission_versions).and_return(
      [submission_version]
    )
    allow(PermitApplicationBlueprint).to receive(:render_as_json).and_return({})
    allow_any_instance_of(described_class).to receive(
      :camelize_response
    ).and_return({})

    exit_status = instance_double(Process::Status, success?: false, to_s: "1")
    allow(Open3).to receive(
      :popen3
    ) do |_a, _b, _c, _json_filename, chdir:, &popen_block|
      stdin = StringIO.new
      stdout = StringIO.new
      stderr = StringIO.new
      wait_thr = instance_double("WaitThread", value: exit_status)
      popen_block.call(stdin, stdout, stderr, wait_thr)
      ["", "", exit_status]
    end

    # We don't want to delete real files outside tmp, so just observe rm_f calls.
    allow(FileUtils).to receive(:rm_f)

    expect { described_class.new.perform("pa1") }.to raise_error(
      RuntimeError,
      /Pdf generation process failed/
    )
    expect(FileUtils).to have_received(:rm_f).at_least(:once)
  end
end
