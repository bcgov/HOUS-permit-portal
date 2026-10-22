class Api::ExplainersController < Api::ApplicationController
  before_action :set_requirement_template

  def show
    explainer = find_or_build
    authorize explainer

    render_success explainer.persisted? ? explainer : nil,
                   nil,
                   explainer_render_opts
  end

  def update
    explainer = find_or_build
    authorize explainer
    explainer.assign_attributes(content_params)

    if explainer.save
      render_success explainer,
                     "explainer.update_success",
                     explainer_render_opts
    else
      render_error(
        "misc.validation_error",
        {
          message_opts: {
            error_message: explainer.errors.full_messages.join(", ")
          }
        }
      )
    end
  rescue Shrine::FileNotFound
    render_error "permit_application.file_not_found_error"
  end

  private

  def set_requirement_template
    @requirement_template =
      RequirementTemplate.find(params[:requirement_template_id])
  end

  def find_or_build
    @requirement_template.explainer || @requirement_template.build_explainer
  end

  def explainer_render_opts
    {
      blueprint: ExplainerBlueprint,
      meta: {
        related_template_options:
          RequirementTemplateOptionBlueprint.render_as_hash(
            related_template_options
          )
      }
    }
  end

  def related_template_options
    RequirementTemplate
      .kept
      .with_published_version
      .where.not(id: @requirement_template.id)
      .preload(:template_category)
      .ordered_by_template_category
  end

  def content_params
    params.require(:explainer).permit(
      :introduction_html,
      :before_you_apply_html,
      :publish,
      related_template_ids: [],
      steps: %i[title description],
      links: %i[title url],
      documents_attributes: [
        :id,
        :_destroy,
        { file: [:id, :storage, { metadata: %i[filename size mime_type] }] }
      ]
    )
  end
end
