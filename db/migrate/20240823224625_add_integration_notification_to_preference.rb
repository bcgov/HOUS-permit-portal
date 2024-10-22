class AddIntegrationNotificationToPreference < ActiveRecord::Migration[7.1]
  def change
    add_column :preferences,
               :enable_in_app_integration_mapping_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_integration_mapping_notification,
               :boolean,
               default: true
  end
end
