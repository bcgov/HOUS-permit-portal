class RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :status, :description, :scheduled_for, :discarded_at, :created_at, :updated_at

  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint

  view :extended do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
    association :template_versions, blueprint: TemplateVersionBlueprint
    association :published_template_version, blueprint: TemplateVersionBlueprint
  end

  view :template_snapshot do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
  end
end
