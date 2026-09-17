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

  describe "#sibling_application" do
    it "is nil when the project has no matching sibling" do
      request = create(:additional_permit_request)
      expect(request.sibling_application).to be_nil
    end

    it "returns the latest matching sibling on the same project" do
      request = create(:additional_permit_request)
      project = request.submission_version.permit_application.permit_project
      sibling_template_version =
        create(
          :template_version,
          requirement_template: request.requirement_template
        )
      older =
        create(
          :permit_application,
          permit_project: project,
          template_version: sibling_template_version
        )
      older.update_column(:updated_at, 2.days.ago)
      newer =
        create(
          :permit_application,
          permit_project: project,
          template_version: sibling_template_version
        )

      expect(request.sibling_application).to eq(newer)
      expect(
        AdditionalPermitRequestBlueprint.render_as_hash(request, view: :base)[
          :sibling_status
        ]
      ).to eq(newer.status)
    end
  end
end
