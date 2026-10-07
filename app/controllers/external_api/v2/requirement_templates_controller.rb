class ExternalApi::V2::RequirementTemplatesController < ExternalApi::ApplicationController
  def index
    authorize RequirementTemplate,
              policy_class: ExternalApi::RequirementTemplatePolicy

    render_success catalog,
                   nil,
                   { blueprint: ExternalApi::RequirementTemplateBlueprint }
  end

  private

  def expected_api_version
    "v2"
  end

  def catalog
    published_template_ids =
      TemplateVersion
        .published_on_kept_templates
        .for_sandbox(current_sandbox)
        .select(:requirement_template_id)

    RequirementTemplate
      .where(id: published_template_ids)
      .includes(
        :template_category,
        published_template_version: {
          requirement_template: :template_category
        }
      )
      .ordered_by_template_category
  end
end
