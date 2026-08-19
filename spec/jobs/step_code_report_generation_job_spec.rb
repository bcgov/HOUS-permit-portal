require "rails_helper"
require "sidekiq/testing"

RSpec.describe StepCodeReportGenerationJob, type: :job do
  before { Sidekiq::Testing.fake! }

  def stub_checklist_report(checklist, report_doc, existing: false)
    allow(checklist).to receive(:report_document).and_return(
      existing ? report_doc : nil
    )
    allow(checklist).to receive(:build_report_document).and_return(report_doc)
    allow(report_doc).to receive(:file=)
    allow(report_doc).to receive(:step_code=)
    allow(report_doc).to receive(:stale=)
    allow(report_doc).to receive(:save!).and_return(true)
  end

  it "locks by step_code_id and checklist_id" do
    expect(
      described_class.lock_args(["sc1", { "checklist_id" => "c1" }])
    ).to eq(%w[sc1 c1])
    expect(described_class.lock_args(["sc1"])).to eq(["sc1", nil])
  end

  it "no-ops when Step Code is missing" do
    allow(StepCode).to receive(:find_by).and_return(nil)
    expect { described_class.new.perform("missing") }.not_to raise_error
  end

  it "skips when checklist data is not present" do
    step_code = instance_double("StepCode", id: "sc1", current_checklist: nil)
    allow(StepCode).to receive(:find_by).with(id: "sc1").and_return(step_code)

    described_class.new.perform("sc1")
  end

  it "renders PDF and attaches report document on success" do
    checklist_blueprint = double("Blueprint", render_as_hash: { "k" => "v" })
    checklist = instance_double("Checklist")
    report_doc = double("ReportDocument")
    stub_checklist_report(checklist, report_doc)

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
        current_stage: "pre_construction",
        current_checklist: checklist,
        checklist_for: checklist,
        checklist_blueprint: checklist_blueprint,
        is_a?: true
      )
    allow(step_code).to receive(:respond_to?).and_return(false)
    allow(step_code).to receive(:class).and_return(Part9StepCode)
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

    expect(checklist).to have_received(:build_report_document).with(
      step_code: step_code
    )
    expect(report_doc).to have_received(:stale=).with(false)
    expect(report_doc).to have_received(:save!)
    expect(NotificationService).to have_received(
      :publish_step_code_report_generated_event
    ).with(report_doc)
  ensure
    FileUtils.rm_f(pdf_path)
  end

  it "replaces the existing report document for the checklist" do
    checklist_blueprint = double("Blueprint", render_as_hash: { "k" => "v" })
    checklist = instance_double("Checklist")
    report_doc = double("ReportDocument")
    stub_checklist_report(checklist, report_doc, existing: true)

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
        current_stage: "pre_construction",
        current_checklist: checklist,
        checklist_for: checklist,
        checklist_blueprint: checklist_blueprint,
        is_a?: true
      )
    allow(step_code).to receive(:respond_to?).and_return(false)
    allow(step_code).to receive(:class).and_return(Part9StepCode)
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

    expect(checklist).not_to have_received(:build_report_document)
    expect(report_doc).to have_received(:stale=).with(false)
    expect(report_doc).to have_received(:save!)
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
        current_stage: "pre_construction",
        current_checklist: checklist,
        checklist_for: checklist,
        checklist_blueprint: checklist_blueprint,
        is_a?: false
      )
    allow(StepCode).to receive(:find_by).and_return(step_code)
    allow(step_code).to receive(:class).and_return(Part3StepCode)
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

  it "renders an explicitly requested checklist id" do
    checklist_blueprint = double("Blueprint", render_as_hash: { "k" => "v" })
    checklist = instance_double("Checklist")
    report_doc = double("ReportDocument")
    stub_checklist_report(checklist, report_doc)

    step_code =
      instance_double(
        "StepCode",
        id: "sc1",
        full_address: "a",
        reference_number: "r",
        title: "t",
        phase: "p",
        current_stage: "as_built",
        permit_date: nil,
        pid: nil,
        pin: nil,
        checklist_for: checklist,
        checklist_blueprint: checklist_blueprint,
        is_a?: false
      )
    allow(step_code).to receive(:respond_to?).and_return(false)
    allow(step_code).to receive(:class).and_return(Part3StepCode)
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

    described_class.new.perform("sc1", { "checklist_id" => "checklist-1" })

    expect(step_code).to have_received(:checklist_for).with(id: "checklist-1")
    expect(checklist).to have_received(:build_report_document).with(
      step_code: step_code
    )
    expect(report_doc).to have_received(:save!)
  ensure
    FileUtils.rm_f(pdf_path)
  end
end
