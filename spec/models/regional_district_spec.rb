require "rails_helper"

RSpec.describe RegionalDistrict, type: :model do
  describe "associations" do
    it { should have_many(:sub_districts) }
  end

  describe ".locality_type" do
    it "returns the expected locality type" do
      expect(described_class.locality_type).to eq("regional district")
    end
  end

  describe ".search" do
    it "scopes search to regional districts" do
      expect(Jurisdiction).to receive(:search).with(
        "foo",
        where: {
          type: "RegionalDistrict"
        }
      )

      described_class.search("foo")
    end
  end

  describe "#regional_district_name" do
    it "returns nil for regional districts" do
      district =
        described_class.create!(
          name: "North Coast",
          locality_type: "regional district",
          description_html: "<p>desc</p>",
          checklist_html: "<p>check</p>",
          look_out_html: "<p>lookout</p>",
          contact_summary_html: "<p>contact</p>",
          inbox_enabled: false,
          external_api_state: "g_off"
        )

      expect(district.regional_district_name).to be_nil
    end
  end
end
