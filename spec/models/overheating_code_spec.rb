require "rails_helper"

RSpec.describe OverheatingCode, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:creator).class_name("User") }
    it { is_expected.to belong_to(:jurisdiction).optional }
  end

  describe "validations" do
    it "is valid with a valid factory" do
      overheating_code = build(:overheating_code)
      expect(overheating_code).to be_valid
    end

    it "requires a creator" do
      overheating_code = build(:overheating_code, creator: nil)
      expect(overheating_code).not_to be_valid
      expect(overheating_code.errors[:creator]).to be_present
    end

    context "postal_code" do
      it "allows blank postal code" do
        overheating_code = build(:overheating_code, postal_code: "")
        expect(overheating_code).to be_valid
      end

      it "allows nil postal code" do
        overheating_code = build(:overheating_code, postal_code: nil)
        expect(overheating_code).to be_valid
      end

      it "accepts a valid BC postal code with space" do
        overheating_code = build(:overheating_code, postal_code: "V7L 1C3")
        expect(overheating_code).to be_valid
      end

      it "accepts a valid BC postal code without space" do
        overheating_code = build(:overheating_code, postal_code: "V7L1C3")
        expect(overheating_code).to be_valid
      end

      it "rejects a non-BC postal code" do
        overheating_code = build(:overheating_code, postal_code: "M5V 2T6")
        expect(overheating_code).not_to be_valid
        expect(overheating_code.errors[:postal_code]).to include(
          "must be a valid BC postal code (e.g. V7L 1C3)"
        )
      end

      it "rejects a random string" do
        overheating_code = build(:overheating_code, postal_code: "12345")
        expect(overheating_code).not_to be_valid
      end
    end
  end

  describe "enums" do
    it "defines status enum" do
      expect(described_class.statuses).to eq("draft" => 0, "submitted" => 1)
    end

    it "defines cooling_zone_units enum" do
      expect(described_class.cooling_zone_units).to eq(
        "imperial" => 0,
        "metric" => 1
      )
    end

    it "defaults status to draft" do
      overheating_code = create(:overheating_code)
      expect(overheating_code.status).to eq("draft")
    end
  end

  describe "search_data" do
    it "includes searchable attributes" do
      overheating_code = create(:overheating_code)

      expect(overheating_code.search_data).to include(
        issued_to: overheating_code.issued_to,
        project_number: overheating_code.project_number,
        building_model: overheating_code.building_model,
        full_address: overheating_code.full_address,
        creator_id: overheating_code.creator_id,
        discarded: false
      )
    end

    it "reports discarded as true when discarded_at is set" do
      overheating_code = create(:overheating_code, :discarded)

      expect(overheating_code.search_data[:discarded]).to be true
    end
  end

  describe "Discard behavior" do
    it "soft-deletes via discard" do
      overheating_code = create(:overheating_code)

      expect { overheating_code.discard }.to change {
        overheating_code.reload.discarded_at
      }.from(nil)
    end

    it "reports discarded? correctly" do
      overheating_code = create(:overheating_code, :discarded)
      expect(overheating_code).to be_discarded
    end

    it "is not discarded by default" do
      overheating_code = create(:overheating_code)
      expect(overheating_code).not_to be_discarded
    end
  end
end
