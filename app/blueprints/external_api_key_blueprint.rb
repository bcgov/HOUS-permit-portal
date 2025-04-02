# frozen_string_literal: true

class ExternalApiKeyBlueprint < Blueprinter::Base
  identifier :id
  fields :name,
         :notification_email,
         :sandbox_id,
         :connecting_application,
         :expired_at,
         :webhook_url,
         :status_scope,
         :revoked_at,
         :updated_at,
         :created_at

  view :with_token do
    field :token
  end
end
