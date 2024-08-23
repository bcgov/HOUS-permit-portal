class PreferenceBlueprint < Blueprinter::Base
  fields :enable_in_app_new_template_version_publish_notification,
         :enable_in_app_customization_update_notification,
         :enable_email_application_submission_notification,
         :enable_in_app_application_submission_notification,
         :enable_email_application_view_notification,
         :enable_in_app_application_view_notification,
         :enable_email_application_revisions_request_notification,
         :enable_in_app_application_revisions_request_notification,
         :enable_in_app_collaboration_notification,
         :enable_email_collaboration_notification,
         :enable_in_app_integration_mapping_notification,
         :enable_email_integration_mapping_notification,
         :created_at,
         :updated_at
end
