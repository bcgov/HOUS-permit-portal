require "rails_helper"

RSpec.describe Sandbox, type: :model do
  describe "validations" do
    subject { create(:sandbox) } # This ensures uniqueness validation works with the existing record.

    it "validates presence of name" do
      should validate_presence_of(:name)
    end

    it "validates uniqueness of name scoped to jurisdiction" do
      should validate_uniqueness_of(:name).scoped_to(
               :jurisdiction_id
             ).with_message("has already been taken")
    end
  end

  describe "unique name validation" do
    let!(:jurisdiction) { create(:sub_district) }
    let!(:other_jurisdiction) { create(:sub_district) }

    let!(:existing_sandbox) do
      create(:sandbox, name: "UniqueName", jurisdiction: jurisdiction)
    end
    let!(:same_name_in_other_jurisdiction) do
      create(:sandbox, name: "SameName", jurisdiction: other_jurisdiction)
    end

    it "does not allow duplicate names within the same jurisdiction" do
      duplicate_sandbox =
        build(:sandbox, name: "UniqueName", jurisdiction: jurisdiction)

      expect(duplicate_sandbox).not_to be_valid
      expect(duplicate_sandbox.errors[:name]).to include(
        "has already been taken"
      )
    end

    it "allows duplicate names in different jurisdictions" do
      sandbox_in_other_jurisdiction =
        build(:sandbox, name: "SameName", jurisdiction: jurisdiction)

      expect(sandbox_in_other_jurisdiction).to be_valid
    end
  end
end
