class Current < ActiveSupport::CurrentAttributes
  attribute :user
  attribute :external_api_key
  attribute :skip_websocket_broadcasts
end
