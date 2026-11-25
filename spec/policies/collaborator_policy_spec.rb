require "rails_helper"

RSpec.describe CollaboratorPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }

  def policy(record, acting_user: user)
    policy_for(described_class, user: acting_user, record:, sandbox:)
  end

  describe "#collaborator_search?" do
    it "permits when the user is a member of the collaborator's jurisdiction" do
      allow(user).to receive(:member_of?).with("j1").and_return(true)
      record = instance_double("Collaborator", jurisdiction_id: "j1")
      expect(policy(record).collaborator_search?).to be true
    end

    it "denies when the user is not a member of the collaborator's jurisdiction" do
      allow(user).to receive(:member_of?).with("j1").and_return(false)
      record = instance_double("Collaborator", jurisdiction_id: "j1")
      expect(policy(record).collaborator_search?).to be false
    end
  end
end
