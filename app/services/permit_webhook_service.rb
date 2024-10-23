class PermitWebhookService
  attr_accessor :external_api_key, :client

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

  def send_submitted_event(permit_id)
    permit_application = PermitApplication.find(permit_id)

    unless permit_application.submitted?
      raise PermitWebhookError.new(
              "Permit application with ID #{permit_id} is not submitted."
            )
    end

    payload = {
      event:
        (
          if permit_application.newly_submitted?
            Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED
          else
            Constants::Webhooks::Events::PermitApplication::PERMIT_RESUBMITTED
          end
        ),
      payload: {
        permit_id: permit_id,
        submitted_at: permit_application.submitted_at
      }
    }

    send_webhook(payload)
  end

  def send_webhook(payload)
    begin
      response = client.post(external_api_key.webhook_url, payload.to_json) # should automatically throw an error if
      # 4xx or 5xx

      response.success?
    rescue Faraday::Error => e
      raise PermitWebhookError.new(
              "Failed to send #{payload[:event]} webhook to #{external_api_key.webhook_url}: #{e.message}"
            )
    end
  end
end
