require "rails_helper"

RSpec.describe WebsocketBroadcaster do
  before do
    allow(ActionCable.server).to receive(:broadcast)
    allow(Current).to receive(:user).and_return(
      instance_double("User", id: "u1")
    )
  end

  describe ".user_channel" do
    it "builds a user channel name" do
      expect(described_class.user_channel("u1")).to include("u1")
    end
  end

  describe ".broadcast_ready?" do
    it "is true when Current.skip_websocket_broadcasts is blank" do
      allow(Current).to receive(:skip_websocket_broadcasts).and_return(nil)
      expect(described_class.broadcast_ready?).to eq(true)
    end

    it "is false when Current.skip_websocket_broadcasts is present" do
      allow(Current).to receive(:skip_websocket_broadcasts).and_return(true)
      expect(described_class.broadcast_ready?).to eq(false)
    end
  end

  describe ".push_notification" do
    it "does nothing when broadcasts are skipped" do
      allow(Current).to receive(:skip_websocket_broadcasts).and_return(true)
      described_class.push_notification({ a: 1 })
      expect(ActionCable.server).not_to have_received(:broadcast)
    end

    it "broadcasts to the current user channel when ready" do
      allow(Current).to receive(:skip_websocket_broadcasts).and_return(nil)
      described_class.push_notification({ a: 1 })
      expect(ActionCable.server).to have_received(:broadcast).with(
        described_class.user_channel("u1"),
        { a: 1 }
      )
    end
  end

  describe ".push_user_payloads" do
    it "returns early when skip flag is present" do
      allow(Current).to receive(:skip_websocket_broadcasts).and_return(true)
      described_class.push_user_payloads({ "u2" => { a: 1 } })
      expect(ActionCable.server).not_to have_received(:broadcast)
    end

    it "broadcasts each payload when ready" do
      allow(Current).to receive(:skip_websocket_broadcasts).and_return(nil)
      described_class.push_user_payloads({ "u2" => { a: 1 }, "u3" => { b: 2 } })
      expect(ActionCable.server).to have_received(:broadcast).with(
        described_class.user_channel("u2"),
        { a: 1 }
      )
      expect(ActionCable.server).to have_received(:broadcast).with(
        described_class.user_channel("u3"),
        { b: 2 }
      )
    end
  end

  describe ".push_update_to_relevant_users" do
    it "broadcasts a standardized payload to each user" do
      described_class.push_update_to_relevant_users(
        %w[u2 u3],
        "domain",
        "type",
        { x: 1 }
      )
      expect(ActionCable.server).to have_received(:broadcast).with(
        described_class.user_channel("u2"),
        { domain: "domain", eventType: "type", data: { x: 1 } }
      )
    end
  end
end
