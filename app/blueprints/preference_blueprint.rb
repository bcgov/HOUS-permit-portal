class PreferenceBlueprint < Blueprinter::Base
  fields :enable_in_app_new_template_version_publish_notification,
         :enable_in_app_customization_update_notification,
         :created_at,
         :updated_at
end
