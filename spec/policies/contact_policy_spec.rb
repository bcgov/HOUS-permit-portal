require "rails_helper"

RSpec.describe ContactPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }

  def policy(record, acting_user: user)
    policy_for(described_class, user: acting_user, record:, sandbox:)
  end

  it "permits create for anyone" do
    record = instance_double("Contact", contactable_id: user.id)
    expect(policy(record).create?).to be true
  end

  it "permits update only for contact owner" do
    record = instance_double("Contact", contactable_id: user.id)
    expect(policy(record).update?).to be true

    other_user = create(:user)
    expect(policy(record, acting_user: other_user).update?).to be false
  end

  it "aliases contact_options? and destroy? to update?" do
    record = instance_double("Contact", contactable_id: user.id)
    expect(policy(record).contact_options?).to be true
    expect(policy(record).destroy?).to be true

    other_user = create(:user)
    expect(policy(record, acting_user: other_user).contact_options?).to be false
    expect(policy(record, acting_user: other_user).destroy?).to be false
  end
end
