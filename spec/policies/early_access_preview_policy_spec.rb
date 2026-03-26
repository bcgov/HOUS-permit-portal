require "rails_helper"

RSpec.describe EarlyAccessPreviewPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("EarlyAccessPreview") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits revoke/unrevoke/extend only for super_admin" do
    super_admin = create(:user, :super_admin)
    expect(policy(super_admin).revoke_access?).to be true
    expect(policy(super_admin).unrevoke_access?).to be true
    expect(policy(super_admin).extend_access?).to be true

    non_admin = create(:user)
    expect(policy(non_admin).revoke_access?).to be false
    expect(policy(non_admin).unrevoke_access?).to be false
    expect(policy(non_admin).extend_access?).to be false
  end
end
