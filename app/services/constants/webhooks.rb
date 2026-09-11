module Constants
  module Webhooks
    # Header on outgoing permit webhooks; value is HMAC-SHA256(request body, API key token) as lowercase hex.
    WEBHOOK_SIGNATURE_HEADER = "X-Webhook-Signature"

    module Events
      module PermitApplication
        PERMIT_SUBMITTED = "permit_submitted"
        PERMIT_RESUBMITTED = "permit_resubmitted"
        STATUS_CHANGED = "permit_application_status_changed"
      end

      module PermitProject
        STATE_CHANGED = "permit_project_state_changed"
      end
    end
  end
end
