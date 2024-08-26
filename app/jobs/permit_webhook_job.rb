class PermitWebhookJob
  include Sidekiq::Worker
  sidekiq_options queue: :webhooks, retry: 8 # exponential back-off shouldn't go over 24 hours

  def perform(external_api_key_id, event_type, permit_application_id)
    external_api_key = ExternalApiKey.find(external_api_key_id)

    service = PermitWebhookService.new(external_api_key)

    service.send_submitted_event(permit_application_id) if event_type == "permit_submitted"
  end
end
