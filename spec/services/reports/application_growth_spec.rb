require "rails_helper"

RSpec.describe Reports::ApplicationGrowth do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  it "returns an empty payload when no live applications exist" do
    expect(payload[:empty]).to eq(true)
    expect(figure("total_created")[:value]).to eq(0)
    expect(payload[:charts].first[:suppressed]).to eq(true)
  end

  it "counts live applications created and submitted in the range" do
    create(:permit_application)
    create(:permit_application, :newly_submitted)
    create(:permit_application, created_at: 2.years.ago)

    expect(payload[:empty]).to eq(false)
    expect(figure("total_created")[:value]).to eq(2)
    expect(figure("total_submitted")[:value]).to eq(1)
    expect(figure("cumulative_processed")[:value]).to eq(1)

    by_month = payload[:tables].find { |tbl| tbl[:key] == "by_month" }[:rows]
    expect(by_month.sum { |row| row["created"] }).to eq(2)
    expect(by_month.sum { |row| row["submitted"] }).to eq(1)
  end

  it "includes a label, value, and help text on each headline figure" do
    figure = payload[:headline_figures].first

    expect(figure[:label]).to be_present
    expect(figure).to have_key(:value)
    expect(figure[:help_text]).to include("Last 12 months")
  end

  it "suppresses growth percentages when the previous period is below the base" do
    create(:permit_application, :newly_submitted)

    mom = figure("mom_submissions")
    expect(mom[:direction]).to eq("suppressed")
    expect(mom[:value]).to include("->")
    expect(mom[:help_text]).to include("too small")
  end

  it "keeps cumulative processed independent of the selected range" do
    application =
      create(:permit_application, :newly_submitted, created_at: 2.years.ago)
    application.submission_versions.update_all(created_at: 2.years.ago)

    short_range =
      described_class.new(range: Reports::Range.parse("3_months")).call
    expect(
      short_range[:headline_figures].find do |row|
        row[:key] == "cumulative_processed"
      end[
        :value
      ]
    ).to eq(1)
  end
end
