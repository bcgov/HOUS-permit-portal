require "rails_helper"

RSpec.describe JurisdictionServicePartnerEnrollment, type: :model do
  describe "associations" do
    it { should belong_to(:jurisdiction) }
  end

  describe "enums" do
    it "defines service_partner values" do
      expect(described_class.service_partners).to include("archistar" => 0)
    end
  end

  describe "validations" do
    it { should validate_presence_of(:service_partner) }

    it "enforces uniqueness per jurisdiction and service_partner" do
      jurisdiction = create(:sub_district)
      described_class.create!(
        jurisdiction: jurisdiction,
        service_partner: :archistar,
        enabled: true
      )

      dup =
        described_class.new(
          jurisdiction: jurisdiction,
          service_partner: :archistar,
          enabled: true
        )

      expect(dup).not_to be_valid
      expect(dup.errors[:jurisdiction_id]).to include("has already been taken")
    end
  end
end
