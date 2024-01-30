class Api::RequirementTemplatesController < Api::ApplicationController
  include Api::Concerns::Search::RequirementTemplates

  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_search
    authorized_results = apply_search_authorization(@search.results)
    render_success @search.results,
                   nil,
                   {
                     meta: {
                       total_pages: @search.total_pages,
                       total_count: @search.total_count,
                       current_page: @search.current_page,
                     },
                     blueprint: RequirementTemplateBlueprint,
                   }
  end

  def create
    @requirement_template = RequirementTemplate.build(requirement_template_params)
    authorize @requirement_template

    if @requirement_template.save
      render_success @requirement_template,
                     "requirement_template.create_success",
                     { blueprint: RequirementTemplateBlueprint }
    else
      render_error Constants::Error::REQUIREMENT_TEMPLATE_CREATE_ERROR,
                   "requirement_template.create_error",
                   message_opts: {
                     error_message: @requirement_template.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def requirement_template_params
    params.require(:requirement_template).permit(:description, :activity_id, :permit_type_id)
  end
end
