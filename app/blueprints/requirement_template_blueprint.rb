class RequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :nickname,
         :type,
         :description,
         :first_nations,
         :label,
         :discarded_at,
         :fetched_at,
         :created_at,
         :updated_at,
         :visibility

  association :permit_type, blueprint: PermitClassificationBlueprint
  association :activity, blueprint: PermitClassificationBlueprint
  association :last_three_deprecated_template_versions,
              blueprint: TemplateVersionBlueprint,
              name: :deprecated_template_versions
  association :scheduled_template_versions, blueprint: TemplateVersionBlueprint
  association :published_template_version,
              blueprint: TemplateVersionBlueprint do |rt, options|
    defaulted_template_version(rt, options)
  end

  association :assignee,
              blueprint: UserBlueprint,
              view: :minimal,
              if: ->(_field_name, rt, options) do
                options[:current_user]&.super_admin?
              end

  view :extended do
    association :requirement_template_sections,
                blueprint: RequirementTemplateSectionBlueprint

    association :published_template_version,
                blueprint: TemplateVersionBlueprint,
                view: :extended do |rt, options|
      defaulted_template_version(rt, options)
    end
  end

  view :template_snapshot do
    association :requirement_template_sections,
                blueprint: RequirementTemplateSectionBlueprint
  end
end

def defaulted_template_version(rt, options)
  if options[:published_template_version].present?
    options[:published_template_version]
  else
    rt.published_template_version
  end
end
