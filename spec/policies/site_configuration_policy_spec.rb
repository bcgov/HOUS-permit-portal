require "rails_helper"

RSpec.describe SiteConfigurationPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("SiteConfiguration") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits update/update_jurisdiction_enrollments only for super_admin" do
    admin = create(:user, :super_admin)
    expect(policy(admin).update?).to be true
    expect(policy(admin).update_jurisdiction_enrollments?).to be true

    user = create(:user)
    expect(policy(user).update?).to be false
    expect(policy(user).update_jurisdiction_enrollments?).to be false
  end

  it "permits show and jurisdiction_enrollments for anyone" do
    expect(policy(create(:user)).show?).to be true
    expect(policy(nil).show?).to be true
    expect(policy(create(:user)).jurisdiction_enrollments?).to be true
  end
end
