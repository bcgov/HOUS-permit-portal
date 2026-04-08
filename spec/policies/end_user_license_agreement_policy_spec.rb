require "rails_helper"

RSpec.describe EndUserLicenseAgreementPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:record) { double("EndUserLicenseAgreement") }

  def policy(user)
    policy_for(described_class, user:, record:, sandbox:)
  end

  it "permits index when user is present" do
    expect(policy(create(:user)).index?).to be true
  end

  it "denies index when user is nil" do
    expect(policy(nil).index?).to be false
  end
end
