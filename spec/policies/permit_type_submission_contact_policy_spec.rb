require "rails_helper"

RSpec.describe PermitTypeSubmissionContactPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { nil }
  let(:record) { double("PermitTypeSubmissionContact") }

  it "permits confirm for anyone" do
    policy = policy_for(described_class, user:, record:, sandbox:)
    expect(policy.confirm?).to be true
  end
end
