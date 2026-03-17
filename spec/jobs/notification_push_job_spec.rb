require "rails_helper"
require "sidekiq/testing"

RSpec.describe NotificationPushJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "publishes to user feeds via NotificationService" do
    allow(NotificationService).to receive(:publish_to_user_feeds)

    payload = { "user_id" => "u1", "notification_id" => "n1" }
    described_class.new.perform(payload)

    expect(NotificationService).to have_received(:publish_to_user_feeds).with(
      payload
    )
  end

  it "is unique until executing on websocket queue" do
    opts = described_class.get_sidekiq_options
    expect((opts["lock"] || opts[:lock]).to_s).to eq("until_executing")
    expect((opts["queue"] || opts[:queue]).to_s).to eq("websocket")
  end
end
