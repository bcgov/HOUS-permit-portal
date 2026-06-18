class TemplateCategoryBlueprint < Blueprinter::Base
  identifier :id

  fields :label, :sort_order, :created_at, :updated_at

  view :extended do
    association :requirement_templates,
                blueprint: RequirementTemplateBlueprint do |category, _options|
      category.requirement_templates
    end
  end
end
