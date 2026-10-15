require "rails_helper"

RSpec.describe StepCodeReportGenerationJob, type: :job do
  let(:checklist) { double("Checklist") }
  let(:step_code) do
    instance_double(StepCode, id: "sc1", current_checklist: checklist)
  end
  let(:generator) { instance_double(PrintReports::Generation, step_code: true) }

  before do
    allow(StepCode).to receive(:find_by).with(id: "sc1").and_return(step_code)
    allow(PrintReports::Generation).to receive(:new).and_return(generator)
  end

  it "locks by step code and checklist" do
    expect(
      described_class.lock_args(["sc1", { "checklist_id" => "c1" }])
    ).to eq(%w[sc1 c1])
  end

  it "skips deleted step codes and absent checklists" do
    allow(StepCode).to receive(:find_by).with(id: "missing").and_return(nil)
    described_class.new.perform("missing")
    allow(step_code).to receive(:current_checklist).and_return(nil)
    described_class.new.perform("sc1")
    expect(generator).not_to have_received(:step_code)
  end

  it "generates a standalone report for the current checklist" do
    described_class.new.perform("sc1")
    expect(generator).to have_received(:step_code).with(
      step_code,
      checklist,
      filename: "step_code_report_sc1.pdf"
    )
  end

  it "honours an explicit checklist and output filename" do
    expect(step_code).to receive(:checklist_for).with(id: "c1").and_return(
      checklist
    )
    described_class.new.perform(
      "sc1",
      "checklist_id" => "c1",
      "outputFilename" => "custom.pdf"
    )
    expect(generator).to have_received(:step_code).with(
      step_code,
      checklist,
      filename: "custom.pdf"
    )
  end

  it "honours the requested stage" do
    expect(step_code).to receive(:checklist_for).with(
      stage: "as_built"
    ).and_return(checklist)
    described_class.new.perform("sc1", "stage" => "as_built")
    expect(generator).to have_received(:step_code)
  end

  it "propagates failures for Sidekiq to retry" do
    allow(generator).to receive(:step_code).and_raise(
      PrintReports::Renderer::Error,
      "conversion failed"
    )
    expect { described_class.new.perform("sc1") }.to raise_error(
      PrintReports::Renderer::Error
    )
  end
end
