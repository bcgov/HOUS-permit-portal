class RemoveIntegrationMappingNotificationPreferences < ActiveRecord::Migration[
  7.2
]
  def change
    remove_column :preferences,
                  :enable_in_app_integration_mapping_notification,
                  :boolean,
                  default: true
    remove_column :preferences,
                  :enable_email_integration_mapping_notification,
                  :boolean,
                  default: true
  end
end
