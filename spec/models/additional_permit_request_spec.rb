require "rails_helper"

RSpec.describe AdditionalPermitRequest, type: :model do
  describe "associations" do
    it { should belong_to(:submission_version) }
    it { should belong_to(:user).optional }
    it { should belong_to(:requirement_template) }
  end

  describe "validations" do
    it { should validate_presence_of(:name_snapshot) }

    it "requires a review_staff user" do
      record =
        build(:additional_permit_request, user: create(:user, :submitter))

      expect(record).not_to be_valid
      expect(record.errors[:user]).to be_present
    end

    it "is valid with a review_staff user" do
      expect(build(:additional_permit_request)).to be_valid
    end

    it "rejects a duplicate template on the same submission version" do
      existing = create(:additional_permit_request)
      duplicate =
        build(
          :additional_permit_request,
          submission_version: existing.submission_version,
          requirement_template: existing.requirement_template
        )

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:requirement_template_id]).to be_present
    end
  end
end
