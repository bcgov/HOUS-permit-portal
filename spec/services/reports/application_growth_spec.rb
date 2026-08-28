require "rails_helper"

RSpec.describe Reports::ApplicationGrowth do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  it "returns an empty payload when no live applications exist" do
    expect(payload[:empty]).to eq(true)
    expect(payload[:headline_figures].first[:value]).to eq(0)
    expect(payload[:charts].first[:suppressed]).to eq(true)
  end

  it "counts live applications created in the range" do
    create(:permit_application)
    create(:permit_application, created_at: 2.years.ago)

    expect(payload[:empty]).to eq(false)
    expect(payload[:headline_figures].first[:value]).to eq(1)
    expect(payload[:tables].first[:rows].sum { |row| row["count"] }).to eq(1)
  end

  it "includes a label, value, and help text on each headline figure" do
    figure = payload[:headline_figures].first

    expect(figure[:label]).to be_present
    expect(figure).to have_key(:value)
    expect(figure[:help_text]).to include("Last 12 months")
  end
end
