require "rails_helper"
require "sidekiq/testing"

RSpec.describe PermitWebhookJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "configures retry, queue, and has no unique lock" do
    opts = described_class.get_sidekiq_options
    expect((opts["queue"] || opts[:queue]).to_s).to eq("webhooks")
    expect(opts["retry"] || opts[:retry]).to eq(8)
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

  it "supports legacy jobs that were queued with a permit ID" do
    key = create(:external_api_key)
    service =
      instance_double(
        "PermitWebhookService",
        send_submitted_event: true,
        send_event: true
      )
    allow(PermitWebhookService).to receive(:new).with(key).and_return(service)

    event_type =
      Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED
    described_class.perform_async(key.id, event_type, "pa-1")
    described_class.perform_one

    expect(service).to have_received(:send_submitted_event).with(
      "pa-1",
      event_type
    )
  end

  it "sends all newly captured event payloads without reloading resources" do
    key = create(:external_api_key)
    service =
      instance_double(
        "PermitWebhookService",
        send_submitted_event: true,
        send_event: true
      )
    allow(PermitWebhookService).to receive(:new).with(key).and_return(service)
    payload = { "occurred_at" => 1_725_000_000_000 }
    events = [
      Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED,
      Constants::Webhooks::Events::PermitApplication::STATUS_CHANGED,
      Constants::Webhooks::Events::PermitProject::STATE_CHANGED
    ]

    events.each do |event_type|
      described_class.perform_async(key.id, event_type, payload)
      described_class.perform_one
      expect(service).to have_received(:send_event).with(event_type, payload)
    end
  end

  it "no-ops for unrelated events" do
    key = create(:external_api_key)
    service =
      instance_double(
        "PermitWebhookService",
        send_submitted_event: true,
        send_event: true
      )
    allow(PermitWebhookService).to receive(:new).with(key).and_return(service)

    described_class.perform_async(key.id, "other.event", "pa-1")
    described_class.perform_one

    expect(service).not_to have_received(:send_submitted_event)
    expect(service).not_to have_received(:send_event)
  end
end
