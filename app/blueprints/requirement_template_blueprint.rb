class RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :description, :label, :discarded_at, :created_at, :updated_at

  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint
  association :last_three_deprecated_template_versions,
              blueprint: TemplateVersionBlueprint,
              name: :deprecated_template_versions
  association :scheduled_template_versions, blueprint: TemplateVersionBlueprint
  association :published_template_version, blueprint: TemplateVersionBlueprint

  view :extended do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
  end

  view :template_snapshot do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
  end
end
