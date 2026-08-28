require "rails_helper"

RSpec.describe Reports::DraftCompletion do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "computes completion from applications created in the range" do
    create(:permit_application)
    create(:permit_application, :newly_submitted)

    expect(figure("completion_rate")[:value]).to eq("50.0%")
  end

  it "counts drafts created before the range that were submitted inside it" do
    application =
      create(:permit_application, :newly_submitted, created_at: 2.years.ago)
    application.submission_versions.update_all(created_at: 1.day.ago)

    expect(figure("created_before_submitted_in_range")[:value]).to eq(1)
    expect(figure("completion_rate")[:value]).to be_nil
  end

  it "states the abandonment definition and buckets stale drafts" do
    application = create(:permit_application)
    application.update_column(:updated_at, 100.days.ago)

    expect(figure("abandonment_rate")[:value]).to eq("100.0%")
    stale = payload[:tables].find { |tbl| tbl[:key] == "stale_drafts" }[:rows]
    ninety = stale.find { |row| row["bucket"].include?("90") }
    expect(ninety["count"]).to eq(1)
    expect(payload[:notes].map { |note| note[:key] }).to include(
      "abandonment_definition",
      "range_boundary"
    )
  end
end
