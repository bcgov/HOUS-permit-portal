class AddResourceReminderNotificationToPreference < ActiveRecord::Migration[7.2]
  def change
    add_column :preferences,
               :enable_in_app_resource_reminder_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_resource_reminder_notification,
               :boolean,
               default: true
  end
end
