class Api::RequirementTemplatesController < Api::ApplicationController
  include Api::Concerns::Search::RequirementTemplates

  before_action :set_requirement_template, only: %i[show destroy restore update]
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

  def show
    authorize @requirement_template

    render_success @requirement_template,
                   nil,
                   { blueprint: RequirementTemplateBlueprint, blueprint_opts: { view: :extended } }
  end

  def create
    @requirement_template = RequirementTemplate.build(requirement_template_params)
    authorize @requirement_template

    if @requirement_template.save
      render_success @requirement_template,
                     "requirement_template.create_success",
                     { blueprint: RequirementTemplateBlueprint }
    else
      render_error "requirement_template.create_error",
                   message_opts: {
                     error_message: @requirement_template.errors.full_messages.join(", "),
                   }
    end
  end

  def update
    authorize @requirement_template

    if @requirement_template.update(requirement_template_params)
      render_success @requirement_template,
                     "requirement_template.update_success",
                     { blueprint: RequirementTemplateBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error "requirement_template.update_error",
                   message_opts: {
                     error_message: @requirement_template.errors.full_messages.join(", "),
                   }
    end
  end

  def destroy
    authorize @requirement_template
    if @requirement_template.discard
      render_success(@requirement_template, "requirement_template.destroy_success")
    else
      render_error "requirement_template.destroy_error"
    end
  end

  def restore
    authorize @requirement_template
    if @requirement_template.update(discarded_at: nil)
      render_success(@requirement_template, "requirement_template.restore_success")
    else
      render_error "requirement_template.restore_error", {}
    end
  end

  private

  def set_requirement_template
    @requirement_template = RequirementTemplate.find(params[:id])
  end

  def requirement_template_params
    params.require(:requirement_template).permit(
      :description,
      :activity_id,
      :permit_type_id,
      requirement_template_sections_attributes: [
        :id,
        :name,
        :position,
        template_section_blocks_attributes: %i[id requirement_block_id position],
      ],
    )
  end
end
