require "rails_helper"

RSpec.describe Reports::JurisdictionEnablement do
  let(:range) { Reports::Range.parse("12_months") }
  let(:payload) { described_class.new(range: range).call }

  def figure(key)
    payload[:headline_figures].find { |row| row[:key] == key }
  end

  def table_rows
    payload[:tables].find { |tbl| tbl[:key] == "jurisdictions" }[:rows]
  end

  it "separates currently enabled, previously enabled, and never enabled" do
    enabled = create(:sub_district)
    create(
      :jurisdiction_enablement_event,
      jurisdiction: enabled,
      enabled: true,
      occurred_at: 2.months.ago,
      source: :observed
    )

    churned = create(:sub_district)
    churned.update_column(:inbox_enabled, false)
    create(
      :jurisdiction_enablement_event,
      jurisdiction: churned,
      enabled: true,
      occurred_at: 6.months.ago,
      source: :observed
    )
    create(
      :jurisdiction_enablement_event,
      jurisdiction: churned,
      enabled: false,
      occurred_at: 1.month.ago,
      source: :observed
    )

    never_enabled = create(:sub_district)
    never_enabled.update_column(:inbox_enabled, false)

    expect(figure("currently_enabled")[:value]).to eq(1)
    expect(figure("previously_enabled")[:value]).to eq(1)
    expect(figure("never_enabled")[:value]).to eq(1)

    churned_row =
      table_rows.find { |row| row["jurisdiction"].include?(churned.name) }
    expect(churned_row["status"]).to include("Previously")
    expect(churned_row["currently_enabled"]).to eq("No")
  end

  it "marks seeded or inferred history as approximate" do
    jurisdiction = create(:sub_district)
    create(
      :jurisdiction_enablement_event,
      jurisdiction: jurisdiction,
      enabled: true,
      occurred_at: 3.months.ago,
      source: :inferred
    )

    row = table_rows.find { |r| r["jurisdiction"].include?(jurisdiction.name) }
    expect(row["approximate"]).to eq("Yes")
    expect(row["cumulative_days"]).to be >= 0
  end

  it "treats currently enabled jurisdictions with a submission in range as active" do
    jurisdiction = create(:sub_district)
    create(
      :jurisdiction_enablement_event,
      jurisdiction: jurisdiction,
      enabled: true,
      occurred_at: 2.months.ago,
      source: :observed
    )
    create(:permit_application, :newly_submitted, jurisdiction: jurisdiction)

    expect(figure("active")[:value]).to eq(1)
    expect(figure("enabled_never_submitted")[:value]).to eq(0)
  end
end
