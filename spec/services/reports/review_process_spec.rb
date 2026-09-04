require "rails_helper"

RSpec.describe Reports::ReviewProcess do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "keeps in-flight applications out of outcome rates" do
    create(:permit_application, :newly_submitted)
    resolved = create(:permit_application, :resubmitted)
    resolved.update_column(:status, PermitApplication.statuses[:approved])

    expect(figure("queue")[:value]).to eq(1)
    expect(figure("revision_request_rate")[:value]).to eq("100.0%")
    expect(figure("mean_revision_rounds")[:value]).to eq(1.0)
    expect(figure("resubmission_success_rate")[:value]).to eq("100.0%")
  end

  it "does not change the queue snapshot with the selected range" do
    application =
      create(:permit_application, :newly_submitted, created_at: 2.years.ago)
    application.submission_versions.update_all(created_at: 2.years.ago)

    short = described_class.new(range: Reports::Range.parse("3_months")).call
    expect(
      short[:headline_figures].find { |row| row[:key] == "queue" }[:value]
    ).to eq(1)
  end

  it "excludes applications missing review timing and states the start point" do
    create(:permit_application, :newly_submitted)

    expect(figure("excluded_timing")[:value]).to eq(1)
    expect(figure("excluded_timing")[:help_text]).to be_present
    expect(payload[:notes].map { |note| note[:key] }).to include(
      "timing_start",
      "aggregate_only"
    )
  end
end
