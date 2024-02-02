class RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :status, :description, :version, :jurisdictions_size, :scheduled_for, :created_at, :updated_at

  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint

  view :extended do
    association :requirement_template_sections, blueprint: RequirementTemplateSectionBlueprint
  end
end
