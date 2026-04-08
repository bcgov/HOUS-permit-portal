require "rails_helper"

RSpec.describe DesignDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }

  def policy(record, acting_user: user)
    policy_for(described_class, user: acting_user, record:, sandbox:)
  end

  describe "#download?" do
    it "permits only when pre_check creator matches" do
      record =
        instance_double(
          "DesignDocument",
          pre_check: instance_double("PreCheck", creator_id: user.id)
        )
      expect(policy(record).download?).to be true

      other_user = create(:user)
      expect(policy(record, acting_user: other_user).download?).to be false
    end
  end
end
