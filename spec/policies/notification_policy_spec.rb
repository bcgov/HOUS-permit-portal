require "rails_helper"

RSpec.describe NotificationPolicy, type: :policy do
  let(:sandbox) { nil }
  let(:user) { create(:user) }
  let(:record) { double("Notification") }

  subject(:policy) { policy_for(described_class, user:, record:, sandbox:) }

  it "permits index and reset_last_read for any logged-in user" do
    expect(policy.index?).to be true
    expect(policy.reset_last_read?).to be true
  end
end
