require "rails_helper"

RSpec.describe RevisionRequest, type: :model do
  describe "associations" do
    it { should belong_to(:submission_version) }
    it { should belong_to(:user).optional }
    it do
      should belong_to(:revision_reason)
               .with_foreign_key(:reason_code)
               .with_primary_key(:reason_code)
               .optional
    end
  end

  describe "validations" do
    it "requires a review_staff user" do
      submission_version = create(:submission_version)
      user = create(:user, :submitter)

      record =
        described_class.new(
          submission_version: submission_version,
          user: user,
          reason_code: "some_code"
        )

      expect(record).not_to be_valid
      expect(record.errors[:user]).to be_present
    end

    it "is valid with a review_staff user" do
      record = build(:revision_request) # factory uses a reviewer user
      expect(record).to be_valid
    end
  end
end
