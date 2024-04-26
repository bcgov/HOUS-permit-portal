# frozen_string_literal: true

class ExternalApiKeyBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :connecting_application, :expired_at, :webhook_url, :revoked_at, :updated_at, :created_at

  view :with_token do
    field :token
  end
end
