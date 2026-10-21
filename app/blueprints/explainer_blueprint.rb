class ExplainerBlueprint < Blueprinter::Base
  identifier :id

  fields :introduction_html,
         :before_you_apply_html,
         :steps,
         :links,
         :related_template_ids,
         :published_at,
         :updated_at

  association :documents, blueprint: ExplainerDocumentBlueprint
end
