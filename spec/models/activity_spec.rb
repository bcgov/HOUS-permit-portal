require "rails_helper"

RSpec.describe Activity, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      activity = build(:activity)
      expect(activity).to be_valid
    end

    it "is not valid without a code" do
      activity = build(:activity, code: nil)
      expect(activity).not_to be_valid
    end

    it "is not valid without a name" do
      activity = build(:activity, name: nil)
      expect(activity).not_to be_valid
    end

    it "is not valid with a duplicate code" do
      create(:activity, code: "ABC")
      activity = build(:activity, code: "ABC")
      expect(activity).not_to be_valid
    end
  end

  describe "#image_url" do
    it "returns the correct image URL" do
      activity = create(:activity, code: "XYZ")
      expected_url = ActionController::Base.helpers.asset_path("images/permit_classifications/XYZ.png")
      expect(activity.image_url).to eq(expected_url)
    end
  end
end
