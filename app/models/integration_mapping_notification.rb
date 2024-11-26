class IntegrationMappingNotification < ApplicationRecord
  belongs_to :notifiable, polymorphic: true
  belongs_to :template_version
end
