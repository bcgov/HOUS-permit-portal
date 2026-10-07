class ExternalApi::RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :nickname, :description, :sort_order

  association :template_category, blueprint: TemplateCategoryBlueprint
  association :published_template_version,
              blueprint: TemplateVersionBlueprint,
              view: :external_api
end
