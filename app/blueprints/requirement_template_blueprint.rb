class RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :description, :discarded_at, :created_at, :updated_at

  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint
  association :template_versions, blueprint: TemplateVersionBlueprint
  association :published_template_version, blueprint: TemplateVersionBlueprint

  view :extended do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
  end

  view :template_snapshot do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
  end
end
