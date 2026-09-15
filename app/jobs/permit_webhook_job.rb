class PermitWebhookJob
  include Sidekiq::Worker
  sidekiq_options queue: :webhooks, retry: 8 # exponential back-off shouldn't go over 24 hours

  def perform(external_api_key_id, event_type, event_payload)
    external_api_key = ExternalApiKey.find(external_api_key_id)

    service = PermitWebhookService.new(external_api_key)

    case event_type
    when Constants::Webhooks::Events::PermitApplication::PERMIT_SUBMITTED,
         Constants::Webhooks::Events::PermitApplication::PERMIT_RESUBMITTED
      if event_payload.is_a?(String)
        # Compatibility for jobs queued before webhook payloads were captured.
        service.send_submitted_event(event_payload, event_type)
      else
        service.send_event(event_type, event_payload)
      end
    when Constants::Webhooks::Events::PermitApplication::STATUS_CHANGED,
         Constants::Webhooks::Events::PermitApplication::PACKAGE_READY,
         Constants::Webhooks::Events::PermitProject::STATE_CHANGED
      service.send_event(event_type, event_payload)
    end
  end
end
