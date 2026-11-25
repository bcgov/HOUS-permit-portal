class PermitWebhookService
  attr_accessor :external_api_key, :client

  # HMAC-SHA256 hex digest of +body+ using +secret+ (the integrator's API key token).
  def self.webhook_signature_hex(secret, body)
    OpenSSL::HMAC.hexdigest("SHA256", secret.to_s, body.to_s)
  end

  def initialize(external_api_key)
    @external_api_key = external_api_key

    unless external_api_key.webhook_url.present?
      raise PermitWebhookError.new(
              "Webhook URL is not present for external API key with ID: #{external_api_key.id}
and name: #{external_api_key.name}"
            )
    end

    unless external_api_key.enabled?
      raise PermitWebhookError.new(
              "External API key with ID: #{external_api_key.id} and name: #{external_api_key.name} is not enabled."
            )
    end

    @client =
      Faraday.new() do |f|
        f.request :json
        f.request :url_encoded
        f.response :raise_error
        f.adapter Faraday.default_adapter
      end
  end

  def send_submitted_event(permit_id, event_type = nil)
    permit_application = PermitApplication.find(permit_id)

    unless permit_application.submitted?
      raise PermitWebhookError.new(
              "Permit application with ID #{permit_id} is not submitted."
            )
    end

    event_type ||=
      if permit_application.resubmitted_at.present?
        Constants::Webhooks::Events::PermitApplication::PERMIT_RESUBMITTED
      else
        Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED
      end

    send_event(
      event_type,
      { permit_id: permit_id, submitted_at: permit_application.submitted_at }
    )
  end

  def send_event(event_type, event_payload)
    send_webhook(event: event_type, payload: event_payload)
  end

  def send_webhook(payload)
    body = payload.to_json
    signature = self.class.webhook_signature_hex(external_api_key.token, body)
    headers = {
      "Content-Type" => "application/json",
      Constants::Webhooks::WEBHOOK_SIGNATURE_HEADER => signature
    }

    begin
      response = client.post(external_api_key.webhook_url, body, headers)

      response.success?
    rescue Faraday::Error => e
      raise PermitWebhookError.new(
              "Failed to send #{payload[:event]} webhook to #{external_api_key.webhook_url}: #{e.message}"
            )
    end
  end
end
