require "rails_helper"

RSpec.describe PermitType, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      permit_type = build(:permit_type)
      expect(permit_type).to be_valid
    end

    it "is not valid without a code" do
      permit_type = build(:permit_type, code: nil)
      expect(permit_type).not_to be_valid
    end

    it "is not valid without a name" do
      permit_type = build(:permit_type, name: nil)
      expect(permit_type).not_to be_valid
    end

    it "is not valid with a duplicate code" do
      create(:permit_type)
      permit_type = build(:permit_type)
      expect(permit_type).not_to be_valid
    end
  end

  describe "#image_url" do
    it "returns the correct image URL" do
      permit_type = create(:permit_type)
      expected_url =
        ActionController::Base.helpers.asset_path(
          "images/permit_classifications/#{permit_type.code}.png"
        )
      expect(permit_type.image_url).to eq(expected_url)
    end
  end
end
