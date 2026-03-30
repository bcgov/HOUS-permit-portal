require "rails_helper"

RSpec.describe ResourceDocumentPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { nil }
  let(:record) { double("ResourceDocument") }

  it "permits download for anyone" do
    policy = policy_for(described_class, user:, record:, sandbox:)
    expect(policy.download?).to be true
  end
end
