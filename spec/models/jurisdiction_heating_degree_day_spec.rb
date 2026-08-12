require "rails_helper"

RSpec.describe JurisdictionHeatingDegreeDay, type: :model do
  subject { build(:jurisdiction_heating_degree_day) }

  it { is_expected.to belong_to(:jurisdiction) }
  it { is_expected.to validate_presence_of(:location_name) }
  it { is_expected.to validate_presence_of(:heating_degree_days) }
  it do
    is_expected.to validate_numericality_of(
      :heating_degree_days
    ).is_greater_than(0).is_less_than_or_equal_to(10_000)
  end

  it "computes climate_zone from HDD" do
    record = build(:jurisdiction_heating_degree_day, heating_degree_days: 2825)
    expect(record.climate_zone).to eq("zone_4")
  end

  it "enforces unique location_name per jurisdiction" do
    jurisdiction = create(:sub_district)
    create(
      :jurisdiction_heating_degree_day,
      jurisdiction: jurisdiction,
      location_name: "General",
      heating_degree_days: 2825
    )

    duplicate =
      build(
        :jurisdiction_heating_degree_day,
        jurisdiction: jurisdiction,
        location_name: "general",
        heating_degree_days: 2925
      )

    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:location_name]).to be_present
  end
end
