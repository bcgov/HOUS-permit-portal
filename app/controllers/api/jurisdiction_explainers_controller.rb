class Api::JurisdictionExplainersController < Api::ApplicationController
  skip_before_action :authenticate_user!, only: :show
  before_action :set_requirement_template
  before_action :set_jurisdiction_explainer

  def show
    authorize @jurisdiction_explainer

    render_success(
      (@jurisdiction_explainer.persisted? ? @jurisdiction_explainer : nil)
    )
  end

  def update
    authorize @jurisdiction_explainer
    @jurisdiction_explainer.assign_attributes(content_params)

    if @jurisdiction_explainer.save
      render_success @jurisdiction_explainer,
                     "jurisdiction_explainer.update_success"
    else
      render_error(
        "misc.validation_error",
        {
          message_opts: {
            error_message:
              @jurisdiction_explainer.errors.full_messages.join(", ")
          }
        }
      )
    end
  end

  private

  def set_requirement_template
    @requirement_template =
      RequirementTemplate.find(params[:requirement_template_id])
  end

  def set_jurisdiction_explainer
    jurisdiction = Jurisdiction.find(params[:jurisdiction_id])
    @jurisdiction_explainer =
      JurisdictionExplainer.find_or_initialize_by(
        requirement_template: @requirement_template,
        jurisdiction: jurisdiction
      )
  end

  def content_params
    params.require(:jurisdiction_explainer).permit(:local_context_html)
  end
end
