class AddUnmappedNotificationToPreference < ActiveRecord::Migration[7.1]
  def change
    add_column :preferences,
               :enable_in_app_unmapped_api_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_unmapped_api_notification,
               :boolean,
               default: true
  end
end
