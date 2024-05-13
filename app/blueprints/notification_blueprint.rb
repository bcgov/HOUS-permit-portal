class NotificationBlueprint < Blueprinter::Base
  fields :id, :action_type, :action_text, :object_data
end
