require "rails_helper"

RSpec.describe CollaboratorPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }

  def policy(record, acting_user: user)
    policy_for(described_class, user: acting_user, record:, sandbox:)
  end

  describe "#collaborator_search?" do
    it "permits when collaboratorable is the user" do
      record =
        instance_double(
          "Collaborator",
          collaboratorable_type: "User",
          collaboratorable_id: user.id
        )
      expect(policy(record).collaborator_search?).to be true
    end

    it "denies when collaboratorable is a different user" do
      record =
        instance_double(
          "Collaborator",
          collaboratorable_type: "User",
          collaboratorable_id: "someone-else"
        )
      expect(policy(record).collaborator_search?).to be false
    end

    it "permits when collaboratorable is a jurisdiction the user is a member of" do
      allow(user).to receive(:member_of?).with("j1").and_return(true)
      record =
        instance_double(
          "Collaborator",
          collaboratorable_type: "Jurisdiction",
          collaboratorable_id: "j1"
        )
      expect(policy(record).collaborator_search?).to be true
    end

    it "denies when collaboratorable type is unsupported" do
      record =
        instance_double(
          "Collaborator",
          collaboratorable_type: "Other",
          collaboratorable_id: "x"
        )
      expect(policy(record).collaborator_search?).to be false
    end
  end
end
