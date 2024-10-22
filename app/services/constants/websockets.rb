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
          update_permit_block_status: :update_permit_block_status
        }.freeze
      end

      module Notification
        DOMAIN = :notification
        TYPES = { new: :new, update: :update }.freeze
      end

      module TemplateVersion
        DOMAIN = :template_version
        TYPES = { update: :update }.freeze
      end
    end
  end
end
