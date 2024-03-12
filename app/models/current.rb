class Current < ActiveSupport::CurrentAttributes
  attribute :user
  attribute :skip_websocket_broadcasts
end
