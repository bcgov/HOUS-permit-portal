require "rails_helper"
require "sidekiq/testing"

RSpec.describe StepCodeReportGenerationJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "locks by step_code_id" do
    expect(described_class.lock_args(%w[sc1 x])).to eq(["sc1"])
  end

  it "no-ops when step code is missing" do
    allow(StepCode).to receive(:find_by).and_return(nil)
    expect { described_class.new.perform("missing") }.not_to raise_error
  end

  it "skips when checklist data is not present" do
    step_code = instance_double("StepCode", id: "sc1", primary_checklist: nil)
    allow(StepCode).to receive(:find_by).with(id: "sc1").and_return(step_code)

    described_class.new.perform("sc1")
  end

  it "renders PDF and attaches report document on success" do
    checklist_blueprint = double("Blueprint", render_as_hash: { "k" => "v" })
    checklist = instance_double("Checklist")
    report_documents_assoc = double("ReportDocumentsAssoc")
    report_doc = double("ReportDocument", save!: true)
    allow(report_doc).to receive(:file=)
    allow(report_documents_assoc).to receive(:build).and_return(report_doc)

    step_code =
      instance_double(
        "StepCode",
        id: "sc1",
        full_address: "a",
        reference_number: "r",
        title: "t",
        phase: "p",
        permit_date: nil,
        pid: nil,
        pin: nil,
        primary_checklist: checklist,
        checklist_blueprint: checklist_blueprint,
        report_documents: report_documents_assoc,
        is_a?: true
      )
    allow(step_code).to receive(:respond_to?).and_return(false)
    allow(step_code).to receive(:is_a?).with(Part9StepCode).and_return(true)
    allow(StepCode).to receive(:find_by).with(id: "sc1").and_return(step_code)

    exit_status = instance_double(Process::Status, success?: true, to_s: "0")
    allow_any_instance_of(described_class).to receive(
      :write_json_to_tmp
    ).and_return(
      Rails.root.join("tmp/files/pdf_json_data_step_code_sc1.json").to_s
    )
    allow_any_instance_of(described_class).to receive(:ensure_directory_exists)

    pdf_path = Rails.root.join("tmp/files/step_code_report_sc1.pdf")
    FileUtils.mkdir_p(pdf_path.dirname)
    allow_any_instance_of(described_class).to receive(
      :run_node_pdf_renderer
    ) do |_job, _json|
      File.write(pdf_path, "%PDF-1.4")
      exit_status
    end

    allow(NotificationService).to receive(
      :publish_step_code_report_generated_event
    )

    described_class.new.perform("sc1", {})

    expect(report_documents_assoc).to have_received(:build)
    expect(report_doc).to have_received(:save!)
    expect(NotificationService).to have_received(
      :publish_step_code_report_generated_event
    ).with(report_doc)
  ensure
    FileUtils.rm_f(pdf_path)
  end

  it "raises on renderer failure" do
    checklist_blueprint = double("Blueprint", render_as_hash: { "k" => "v" })
    checklist = instance_double("Checklist")
    step_code =
      double(
        "StepCode",
        id: "sc1",
        full_address: "a",
        reference_number: "r",
        title: "t",
        phase: "p",
        permit_date: nil,
        pid: nil,
        pin: nil,
        primary_checklist: checklist,
        checklist_blueprint: checklist_blueprint,
        is_a?: false
      )
    allow(StepCode).to receive(:find_by).and_return(step_code)
    allow_any_instance_of(described_class).to receive(:ensure_directory_exists)
    allow_any_instance_of(described_class).to receive(
      :write_json_to_tmp
    ).and_return(
      Rails.root.join("tmp/files/pdf_json_data_step_code_sc1.json").to_s
    )

    exit_status = instance_double(Process::Status, success?: false, to_s: "1")
    allow_any_instance_of(described_class).to receive(
      :run_node_pdf_renderer
    ).and_return(exit_status)

    expect { described_class.new.perform("sc1", {}) }.to raise_error(
      RuntimeError,
      /StepCode report PDF generation failed/
    )
  end
end
