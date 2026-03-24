require "rails_helper"

RSpec.describe InvitationPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("Invitation") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  describe "#create?" do
    it "permits privileged roles" do
      expect(policy(create(:user, :super_admin)).create?).to be true
      expect(policy(create(:user, :review_manager)).create?).to be true
      expect(policy(create(:user, :regional_review_manager)).create?).to be true
      expect(policy(create(:user, :technical_support)).create?).to be true
    end

    it "denies normal users" do
      expect(policy(create(:user)).create?).to be false
    end
  end

  it "permits remove only for super_admin" do
    expect(policy(create(:user, :super_admin)).remove?).to be true
    expect(policy(create(:user, :review_manager)).remove?).to be false
  end

  it "permits update for review_staff or technical_support" do
    expect(policy(create(:user, :review_manager)).update?).to be true
    expect(policy(create(:user, :technical_support)).update?).to be true
    expect(policy(create(:user)).update?).to be false
  end
end
