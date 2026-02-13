class TemplateVersionFeedbackBlueprint < Blueprinter::Base
  identifier :id
  fields :sentiment, :body, :resolved, :created_at, :updated_at

  association :user, blueprint: UserBlueprint, view: :minimal
  association :resolved_by, blueprint: UserBlueprint, view: :minimal
end
