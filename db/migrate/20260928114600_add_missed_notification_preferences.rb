class AddMissedNotificationPreferences < ActiveRecord::Migration[7.2]
  def change
    change_table :preferences, bulk: true do |t|
      t.boolean :enable_email_project_meeting_scheduled_notification,
                default: true
      t.boolean :enable_in_app_project_meeting_scheduled_notification,
                default: true
      t.boolean :enable_email_project_meeting_rescheduled_notification,
                default: true
      t.boolean :enable_in_app_project_meeting_rescheduled_notification,
                default: true
      t.boolean :enable_email_pre_check_submitted_notification, default: true
      t.boolean :enable_in_app_pre_check_submitted_notification, default: true
      t.boolean :enable_email_pre_check_completed_notification, default: true
      t.boolean :enable_in_app_pre_check_completed_notification, default: true
      t.boolean :enable_in_app_step_code_report_notification, default: true
      t.boolean :enable_in_app_file_upload_failed_notification, default: true
    end
  end
end
