class RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :description,
         :first_nations,
         :label,
         :discarded_at,
         :created_at,
         :updated_at

  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint
  association :last_three_deprecated_template_versions,
              blueprint: TemplateVersionBlueprint,
              name: :deprecated_template_versions
  association :scheduled_template_versions, blueprint: TemplateVersionBlueprint
  association :published_template_version,
              blueprint: TemplateVersionBlueprint do |rt, options|
    if options[:published_template_version].present?
      options[:published_template_version]
    else
      rt.published_template_version
    end
  end

  view :extended do
    association :requirement_template_sections,
                blueprint: RequirementTemplateSectionBlueprint
  end

  view :template_snapshot do
    association :requirement_template_sections,
                blueprint: RequirementTemplateSectionBlueprint
  end
end
