require "rails_helper"

RSpec.describe Part9StepCodePolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }
  let(:record) { double("StepCode", creator: user) }

  it "adds select_options? = true" do
    policy = policy_for(described_class, user:, record:, sandbox:)
    expect(policy.select_options?).to be true
  end
end
