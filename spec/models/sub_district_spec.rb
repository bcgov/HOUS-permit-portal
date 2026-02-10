require "rails_helper"

RSpec.describe SubDistrict, type: :model do
  subject(:sub_district) { build(:sub_district) }

  describe "associations" do
    it { should belong_to(:regional_district).optional }
  end

  describe ".search" do
    it "scopes search to sub districts" do
      expect(Jurisdiction).to receive(:search).with(
        "foo",
        where: {
          type: "SubDistrict"
        }
      )

      described_class.search("foo")
    end
  end

  describe "#regional_district_name" do
    it "returns the regional district reverse qualified name when present" do
      regional_district =
        RegionalDistrict.create!(
          name: "East Valley",
          locality_type: "regional district",
          description_html: "<p>desc</p>",
          checklist_html: "<p>check</p>",
          look_out_html: "<p>lookout</p>",
          contact_summary_html: "<p>contact</p>",
          inbox_enabled: false,
          external_api_state: "g_off"
        )
      sub_district = create(:sub_district, regional_district: regional_district)

      expect(sub_district.regional_district_name).to eq(
        regional_district.reverse_qualified_name
      )
    end

    it "returns nil when regional district is missing" do
      sub_district = create(:sub_district, regional_district: nil)

      expect(sub_district.regional_district_name).to be_nil
    end
  end
end
