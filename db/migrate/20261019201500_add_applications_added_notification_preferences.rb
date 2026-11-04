class AddApplicationsAddedNotificationPreferences < ActiveRecord::Migration[7.2]
  def change
    add_column :preferences,
               :enable_in_app_applications_added_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_applications_added_notification,
               :boolean,
               default: true
  end
end
