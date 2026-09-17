require "rails_helper"

RSpec.describe SupportingInformationRequest, type: :model do
  describe "associations" do
    it { should belong_to(:submission_version) }
    it { should belong_to(:user).optional }
    it { should have_many(:project_documents).dependent(:destroy) }
  end

  describe "validations" do
    it { should validate_presence_of(:title) }

    it "requires a review_staff user" do
      record =
        build(:supporting_information_request, user: create(:user, :submitter))

      expect(record).not_to be_valid
      expect(record.errors[:user]).to be_present
    end

    it "is valid with a review_staff user" do
      expect(build(:supporting_information_request)).to be_valid
    end
  end
end
