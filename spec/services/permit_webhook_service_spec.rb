require "rails_helper"

RSpec.describe PermitWebhookService do
  let(:jurisdiction) { create(:sub_district, external_api_state: "j_on") }
  let(:external_api_key) do
    create(
      :external_api_key,
      jurisdiction: jurisdiction,
      webhook_url: "https://example.com/webhook",
      revoked_at: nil,
      expired_at: 1.day.from_now
    )
  end

  describe "#initialize" do
    it "raises when webhook_url is missing" do
      key = build(:external_api_key, webhook_url: nil)
      expect { described_class.new(key) }.to raise_error(
        PermitWebhookError,
        /Webhook URL is not present/
      )
    end

    it "raises when external_api_key is not enabled" do
      allow_any_instance_of(ExternalApiKey).to receive(:enabled?).and_return(
        false
      )
      expect { described_class.new(external_api_key) }.to raise_error(
        PermitWebhookError,
        /is not enabled/
      )
    end

    it "initializes Faraday client when valid" do
      service = described_class.new(external_api_key)
      expect(service.client).to be_a(Faraday::Connection)
    end
  end

  describe "#send_submitted_event" do
    let(:permit_application) { create(:permit_application, :newly_submitted) }

    it "raises if permit is not submitted" do
      pa = create(:permit_application)
      service = described_class.new(external_api_key)
      expect { service.send_submitted_event(pa.id) }.to raise_error(
        PermitWebhookError,
        /is not submitted/
      )
    end

    it "uses PERMIT_SUBMITTED when newly_submitted? is true and sends expected payload" do
      service = described_class.new(external_api_key)

      allow(PermitApplication).to receive(:find).with(
        permit_application.id
      ).and_return(permit_application)
      allow(permit_application).to receive(:newly_submitted?).and_return(true)

      expect(service.client).to receive(:post) do |url, body|
        expect(url).to eq(external_api_key.webhook_url)
        json = JSON.parse(body)
        expect(json["event"]).to eq(
          Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED
        )
        expect(json["payload"]["permit_id"]).to eq(permit_application.id)
        expect(json["payload"]["submitted_at"]).to eq(
          permit_application.submitted_at.as_json
        )
        instance_double(Faraday::Response, success?: true)
      end

      expect(service.send_submitted_event(permit_application.id)).to be_truthy
    end

    it "uses PERMIT_RESUBMITTED when newly_submitted? is false" do
      service = described_class.new(external_api_key)
      resubmitted_pa = create(:permit_application, :resubmitted)

      allow(PermitApplication).to receive(:find).with(
        resubmitted_pa.id
      ).and_return(resubmitted_pa)

      expect(service.client).to receive(:post) do |url, body|
        expect(url).to eq(external_api_key.webhook_url)
        json = JSON.parse(body)
        expect(json["event"]).to eq(
          Constants::Webhooks::Events::PermitApplication::PERMIT_RESUBMITTED
        )
        instance_double(Faraday::Response, success?: true)
      end

      expect(service.send_submitted_event(resubmitted_pa.id)).to be_truthy
    end

    it "raises PermitWebhookError when Faraday raises" do
      service = described_class.new(external_api_key)
      allow(PermitApplication).to receive(:find).and_return(permit_application)
      allow(permit_application).to receive(:newly_submitted?).and_return(true)

      # Simulate Faraday client raising an error on post
      allow(service.client).to receive(:post).and_raise(
        Faraday::ClientError.new("boom")
      )

      expect do
        service.send_submitted_event(permit_application.id)
      end.to raise_error(PermitWebhookError, /Failed to send/)
    end
  end
end
