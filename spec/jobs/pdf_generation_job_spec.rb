require "rails_helper"

RSpec.describe PdfGenerationJob, type: :job do
  it "locks by permit application" do
    expect(described_class.lock_args(%w[pa1 other])).to eq(["pa1"])
  end

  it "renders only the requested submission versions" do
    application = create(:permit_application, :newly_submitted)
    version = application.latest_submission_version
    generator = instance_double(PrintReports::Generation)
    allow(PrintReports::Generation).to receive(:new).and_return(generator)
    expect(generator).to receive(:submission).with(version).once
    described_class.new.perform(application.id, [version.id])
    expect(generator).not_to receive(:submission)
    described_class.new.perform(application.id, [])
  end

  it "propagates rendering failures for Sidekiq to retry" do
    application = create(:permit_application, :newly_submitted)
    allow_any_instance_of(PrintReports::Generation).to receive(
      :submission
    ).and_raise(PrintReports::Renderer::Error, "conversion failed")
    expect { described_class.new.perform(application.id) }.to raise_error(
      PrintReports::Renderer::Error,
      "conversion failed"
    )
  end
end
