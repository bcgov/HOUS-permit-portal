module Constants
  module Websockets
    module Channels
      USER_CHANNEL_PREFIX = "user_channel"
    end

    module Events
      module PermitApplication
        DOMAIN = :permit_application
        TYPES = {
          update_compliance: :update_compliance,
          update_supporting_documents: :update_supporting_documents,
        }.freeze
      end
    end
  end
end
