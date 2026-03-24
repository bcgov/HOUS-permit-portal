require "rails_helper"

RSpec.describe DigitalSealValidatorPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }

  it "permits create for anyone" do
    record = double("DigitalSealValidation")
    policy = policy_for(described_class, user:, record:, sandbox:)
    expect(policy.create?).to be true
  end
end
