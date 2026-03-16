require "rails_helper"
require "sidekiq/testing"

RSpec.describe PermitWebhookJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "configures retry and queue" do
    opts = described_class.get_sidekiq_options
    expect((opts["queue"] || opts[:queue]).to_s).to eq("webhooks")
    expect(opts["retry"] || opts[:retry]).to eq(8)
  end

  it "sends submitted/resubmitted events via PermitWebhookService" do
    key = create(:external_api_key)
    service =
      instance_double("PermitWebhookService", send_submitted_event: true)
    allow(PermitWebhookService).to receive(:new).with(key).and_return(service)

    described_class.perform_async(
      key.id,
      Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED,
      "pa-1"
    )
    described_class.perform_one

    expect(service).to have_received(:send_submitted_event).with("pa-1")
  end

  it "no-ops for unrelated events" do
    key = create(:external_api_key)
    service =
      instance_double("PermitWebhookService", send_submitted_event: true)
    allow(PermitWebhookService).to receive(:new).with(key).and_return(service)

    described_class.perform_async(key.id, "other.event", "pa-1")
    described_class.perform_one

    expect(service).not_to have_received(:send_submitted_event)
  end
end
