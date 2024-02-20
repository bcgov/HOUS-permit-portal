require "rails_helper"

RSpec.describe RequirementTemplate, type: :model do
  let(:jurisdiction) { create(:jurisdiction) }
  let(:another_jurisdiction) { create(:jurisdiction) }
  let(:permit_type) { create(:permit_type) }
  let(:activity) { create(:activity) }
  let(:another_permit_type) { create(:permit_type) }
  let(:another_activity) { create(:activity) }

  context "when creating published requirement templates with unique pairs of permit_type_id and activity_id within the same jurisdiction" do
    it "allows creating multiple published templates if both classifications different" do
      create(
        :requirement_template,
        status: "published",
        permit_type: permit_type,
        activity: activity,
        jurisdictions: [jurisdiction],
      )
      new_template =
        build(
          :requirement_template,
          status: "published",
          permit_type: another_permit_type,
          activity: another_activity,
          jurisdictions: [jurisdiction],
        )
      expect(new_template).to be_valid
    end

    it "allows creating multiple published templates if one classification different" do
      create(
        :requirement_template,
        status: "published",
        permit_type: permit_type,
        activity: activity,
        jurisdictions: [jurisdiction],
      )
      new_template =
        build(
          :requirement_template,
          status: "published",
          permit_type: permit_type,
          activity: another_activity,
          jurisdictions: [jurisdiction],
        )
      expect(new_template).to be_valid
    end

    it "allows creating multiple published templates if jurisdiction different" do
      create(
        :requirement_template,
        status: "published",
        permit_type: permit_type,
        activity: activity,
        jurisdictions: [jurisdiction],
      )
      new_template =
        build(
          :requirement_template,
          status: "published",
          permit_type: permit_type,
          activity: activity,
          jurisdictions: [another_jurisdiction],
        )
      expect(new_template).to be_valid
    end
  end

  context "when creating a published requirement template with a non-unique pair of permit_type_id and activity_id within the same jurisdiction" do
    it "does not allow creating the template" do
      create(
        :requirement_template,
        status: "published",
        permit_type: permit_type,
        activity: activity,
        jurisdictions: [jurisdiction],
      )
      duplicate_template =
        build(
          :requirement_template,
          status: "published",
          permit_type: permit_type,
          activity: activity,
          jurisdictions: [jurisdiction],
        )
      expect(duplicate_template).not_to be_valid
      expect(duplicate_template.errors[:base]).to include(
        "should be unique per permit_type_id and activity_id within the same jurisdiction",
      )
    end
  end

  context "when creating a draft requirement template with a non-unique pair of permit_type_id and activity_id within the same jurisdiction" do
    it "allows creating the template" do
      create(
        :requirement_template,
        status: "published",
        permit_type: permit_type,
        activity: activity,
        jurisdictions: [jurisdiction],
      )
      draft_template =
        build(
          :requirement_template,
          status: "draft",
          permit_type: permit_type,
          activity: activity,
          jurisdictions: [jurisdiction],
        )
      expect(draft_template).to be_valid
    end
  end
end
