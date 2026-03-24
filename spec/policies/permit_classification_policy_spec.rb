require "rails_helper"

RSpec.describe PermitClassificationPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { create(:permit_classification) }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits index for anyone" do
    expect(policy(create(:user)).index?).to be true
    expect(policy(nil).index?).to be true
  end

  it "aliases permit_classification_options? to index?" do
    expect(policy(create(:user)).permit_classification_options?).to be true
  end

  it "permits create/update/destroy only for super_admin" do
    admin = create(:user, :super_admin)
    expect(policy(admin).create?).to be true
    expect(policy(admin).update?).to be true
    expect(policy(admin).destroy?).to be true

    normal = create(:user)
    expect(policy(normal).create?).to be false
    expect(policy(normal).update?).to be false
    expect(policy(normal).destroy?).to be false
  end

  it "scope returns all" do
    user = create(:user)
    resolved =
      scope_for(
        described_class,
        user:,
        scope: PermitClassification.all,
        sandbox:
      )
    expect(resolved).to match_array(PermitClassification.all)
  end
end
