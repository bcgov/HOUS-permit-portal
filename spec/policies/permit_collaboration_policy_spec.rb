require "rails_helper"

RSpec.describe PermitCollaborationPolicy, type: :policy do
  let(:jurisdiction) { create(:sub_district) }
  let(:sandbox) { jurisdiction.sandboxes.first }
  let(:submitter) { create(:user, :submitter) }

  def policy(user, record)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#destroy?" do
    it "permits submitter to destroy submission collaborations" do
      pa =
        instance_double(
          "PermitApplication",
          submitter: submitter,
          jurisdiction_id: jurisdiction.id
        )
      record =
        instance_double(
          "PermitCollaboration",
          submission?: true,
          review?: false,
          permit_application: pa
        )

      expect(policy(submitter, record).destroy?).to be true
      expect(policy(create(:user, :submitter), record).destroy?).to be false
    end

    it "permits review staff to destroy review collaborations for their jurisdiction" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      pa =
        instance_double(
          "PermitApplication",
          submitter: submitter,
          jurisdiction_id: jurisdiction.id
        )
      record =
        instance_double(
          "PermitCollaboration",
          submission?: false,
          review?: true,
          permit_application: pa
        )

      expect(policy(reviewer, record).destroy?).to be true
    end

    it "denies when neither submission nor review collaboration" do
      pa =
        instance_double(
          "PermitApplication",
          submitter: submitter,
          jurisdiction_id: jurisdiction.id
        )
      record =
        instance_double(
          "PermitCollaboration",
          submission?: false,
          review?: false,
          permit_application: pa
        )
      expect(policy(submitter, record).destroy?).to be false
    end
  end

  describe "#reinvite?" do
    it "permits submitter to reinvite submission delegatee submitters" do
      collaborator_user = create(:user, :submitter)
      collaborator = instance_double("Collaborator", user: collaborator_user)
      pa = instance_double("PermitApplication", submitter: submitter)
      record =
        instance_double(
          "PermitCollaboration",
          submission?: true,
          collaborator: collaborator,
          permit_application: pa
        )

      expect(policy(submitter, record).reinvite?).to be true
      expect(policy(create(:user, :submitter), record).reinvite?).to be false
    end
  end
end
