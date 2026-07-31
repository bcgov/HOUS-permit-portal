require "rails_helper"
require "sidekiq/testing"

RSpec.describe StepCodeReportGenerationJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "locks by step_code_id" do
    expect(described_class.lock_args(%w[sc1 x])).to eq(["sc1"])
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

  it "renders PDF via HtmlPdfService and attaches report document on success" do
    checklist = instance_double("Checklist", id: "cl1")
    report_documents_assoc = double("ReportDocumentsAssoc")
    report_doc = double("ReportDocument", save!: true)
    allow(report_doc).to receive(:file=)
    allow(report_documents_assoc).to receive(:build).and_return(report_doc)

    step_code =
      instance_double(
        "StepCode",
        id: "sc1",
        current_checklist: checklist,
        checklist_for: checklist,
        report_documents: report_documents_assoc
      )
    allow(StepCode).to receive(:find_by).with(id: "sc1").and_return(step_code)

    allow_any_instance_of(described_class).to receive(
      :render_checklist_pdf_bytes
    ).and_return("%PDF-1.4 checklist")

    allow(NotificationService).to receive(
      :publish_step_code_report_generated_event
    )

    described_class.new.perform("sc1", {})

    expect(report_documents_assoc).to have_received(:build)
    expect(report_doc).to have_received(:save!)
    expect(NotificationService).to have_received(
      :publish_step_code_report_generated_event
    ).with(report_doc)
  end

  it "raises when HtmlPdfService fails" do
    checklist = instance_double("Checklist", id: "cl1")
    step_code =
      instance_double(
        "StepCode",
        id: "sc1",
        current_checklist: checklist,
        checklist_for: checklist
      )
    allow(StepCode).to receive(:find_by).and_return(step_code)

    allow_any_instance_of(described_class).to receive(
      :render_checklist_pdf_bytes
    ).and_raise(HtmlPdfService::Error, "boom")

    expect { described_class.new.perform("sc1", {}) }.to raise_error(
      HtmlPdfService::Error,
      /boom/
    )
  end

  it "renders an explicitly requested checklist id" do
    checklist = instance_double("Checklist", id: "checklist-1")
    report_documents_assoc = double("ReportDocumentsAssoc")
    report_doc = double("ReportDocument", save!: true)
    allow(report_doc).to receive(:file=)
    allow(report_documents_assoc).to receive(:build).and_return(report_doc)

    step_code =
      instance_double(
        "StepCode",
        id: "sc1",
        current_checklist: nil,
        checklist_for: checklist,
        report_documents: report_documents_assoc
      )
    allow(StepCode).to receive(:find_by).with(id: "sc1").and_return(step_code)

    allow_any_instance_of(described_class).to receive(
      :render_checklist_pdf_bytes
    ).and_return("%PDF-1.4")

    allow(NotificationService).to receive(
      :publish_step_code_report_generated_event
    )

    described_class.new.perform("sc1", { "checklist_id" => "checklist-1" })

    expect(step_code).to have_received(:checklist_for).with(id: "checklist-1")
    expect(report_doc).to have_received(:save!)
  end
end
