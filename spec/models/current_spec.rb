require "rails_helper"

RSpec.describe Current, type: :model do
  it "stores and resets per-thread attributes" do
    user = create(:user)
    api_key = create(:external_api_key)

    described_class.user = user
    described_class.external_api_key = api_key
    described_class.skip_websocket_broadcasts = true
    described_class.sandbox_id = SecureRandom.uuid

    expect(described_class.user).to eq(user)
    expect(described_class.external_api_key).to eq(api_key)
    expect(described_class.skip_websocket_broadcasts).to eq(true)
    expect(described_class.sandbox_id).to be_present

    described_class.reset

    expect(described_class.user).to be_nil
    expect(described_class.external_api_key).to be_nil
    expect(described_class.skip_websocket_broadcasts).to be_nil
    expect(described_class.sandbox_id).to be_nil
  end
end
