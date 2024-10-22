class AddRevisionFlowBooleansToPreferences < ActiveRecord::Migration[7.1]
  def change
    add_column :preferences,
               :enable_email_application_submission_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_in_app_application_submission_notification,
               :boolean,
               default: true

    add_column :preferences,
               :enable_email_application_view_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_in_app_application_view_notification,
               :boolean,
               default: true

    add_column :preferences,
               :enable_email_application_revisions_request_notification,
               :boolean,
               default: true
    add_column :preferences,
               :enable_in_app_application_revisions_request_notification,
               :boolean,
               default: true
  end
end
