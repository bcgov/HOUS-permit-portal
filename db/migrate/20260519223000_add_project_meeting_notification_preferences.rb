class AddProjectMeetingNotificationPreferences < ActiveRecord::Migration[7.2]
  def change
    add_column :preferences,
               :enable_in_app_project_meeting_submitted_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_email_project_meeting_submitted_notification,
               :boolean,
               default: true
  end
end
