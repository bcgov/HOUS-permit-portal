class Api::RequirementTemplatesController < Api::ApplicationController
  include Api::Concerns::Search::RequirementTemplates

  before_action :set_requirement_template, only: %i[show destroy restore update schedule force_publish_now]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_search
    authorized_results = apply_search_authorization(@search.results)
    render_success authorized_results,
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

  def schedule
    authorize @requirement_template

    ActiveRecord::Base.transaction do
      unless @requirement_template.update(requirement_template_params)
        render_error "requirement_template.schedule_error",
                     message_opts: {
                       error_message: @requirement_template.errors.full_messages.join(", "),
                     }
      end

      begin
        scheduled_template_version =
          TemplateVersioningService.schedule!(@requirement_template, Date.parse(schedule_params))
      rescue StandardError => e
        # If there is an error in TemplateVersioningService.schedule!, rollback the transaction
        render_error "requirement_template.schedule_error", message_opts: { error_message: e.message }
        raise ActiveRecord::Rollback
      end

      # A reload is required, otherwise the new template version is not ordered correctly
      @requirement_template.reload

      render_success @requirement_template,
                     "requirement_template.schedule_success",
                     { blueprint: RequirementTemplateBlueprint, blueprint_opts: { view: :extended } }
    end
  end

  def force_publish_now
    authorize @requirement_template

    ActiveRecord::Base.transaction do
      unless @requirement_template.update(requirement_template_params)
        render_error "requirement_template.force_publish_now_error",
                     message_opts: {
                       error_message: @requirement_template.errors.full_messages.join(", "),
                     }
      end

      begin
        published_template_version = TemplateVersioningService.force_publish_now!(@requirement_template)
      rescue StandardError => e
        # If there is an error in TemplateVersioningService.schedule!, rollback the transaction
        render_error "requirement_template.force_publish_now_error", message_opts: { error_message: e.message }
        raise ActiveRecord::Rollback
      end

      # A reload is required, otherwise the new template version is not ordered correctly
      @requirement_template.reload

      render_success @requirement_template,
                     "requirement_template.force_publish_now_success",
                     { blueprint: RequirementTemplateBlueprint, blueprint_opts: { view: :extended } }
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
    permitted_params =
      params.require(:requirement_template).permit(
        :description,
        :activity_id,
        :permit_type_id,
        requirement_template_sections_attributes: [
          :id,
          :name,
          :position,
          :_destroy,
          template_section_blocks_attributes: %i[id requirement_block_id position _destroy],
        ],
      )

    # This is a workaround needed to validate step code related errors
    if permitted_params[:requirement_template_sections_attributes].present?
      permitted_params[:requirement_template_sections_attributes_copy] = permitted_params[
        :requirement_template_sections_attributes
      ].deep_dup
    end

    permitted_params
  end

  def schedule_params
    params.require(:version_date)
  end
end
