class Api::RequirementTemplatesController < Api::ApplicationController
  include Api::Concerns::Search::RequirementTemplates
  before_action :set_requirement_template,
                only: %i[show destroy restore update schedule force_publish_now]
  before_action :set_template_version, only: %i[unschedule_template_version]
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
                       current_page: @search.current_page
                     },
                     blueprint: RequirementTemplateBlueprint,
                     blueprint_opts: {
                       current_user: current_user
                     }
                   }
  end

  def show
    authorize @requirement_template

    render_success @requirement_template,
                   nil,
                   {
                     blueprint: RequirementTemplateBlueprint,
                     blueprint_opts: {
                       view: :extended,
                       current_user: current_user
                     }
                   }
  end

  def create
    @requirement_template = RequirementTemplate.new(requirement_template_params)
    authorize @requirement_template
    if @requirement_template.save
      render_success @requirement_template,
                     "requirement_template.create_success",
                     { blueprint: RequirementTemplateBlueprint }
    else
      render_error "requirement_template.create_error",
                   message_opts: {
                     error_message:
                       @requirement_template.errors.full_messages.join(", ")
                   }
    end
  end

  def copy
    found_template =
      if requirement_template_params[:id].present?
        RequirementTemplate.find_by(id: requirement_template_params[:id])
      elsif requirement_template_params[:permit_type_id].present? &&
            requirement_template_params[:activity_id].present?
        LiveRequirementTemplate.find_by(
          permit_type_id: requirement_template_params[:permit_type_id],
          activity_id: requirement_template_params[:activity_id]
        )
      end

    if found_template.nil?
      authorize :requirement_template, :create?
      render_error("misc.not_found_error", status: :not_found) and return
    end

    @requirement_template =
      RequirementTemplateCopyService.new(
        found_template
      ).build_requirement_template_from_existing(requirement_template_params)
    authorize @requirement_template

    if @requirement_template.save
      render_success @requirement_template,
                     "requirement_template.copy_success",
                     { blueprint: RequirementTemplateBlueprint }
    else
      render_error "requirement_template.copy_error",
                   message_opts: {
                     error_message:
                       @requirement_template.errors.full_messages.join(", ")
                   }
    end
  end

  def update
    authorize @requirement_template

    if @requirement_template.update(requirement_template_params)
      render_success @requirement_template,
                     "requirement_template.update_success",
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    else
      render_error "requirement_template.update_error",
                   message_opts: {
                     error_message:
                       @requirement_template.errors.full_messages.join(", ")
                   }
    end
  end

  def schedule
    authorize @requirement_template

    ActiveRecord::Base.transaction do
      unless @requirement_template.update(requirement_template_params)
        render_error "requirement_template.schedule_error",
                     message_opts: {
                       error_message:
                         @requirement_template.errors.full_messages.join(", ")
                     }
      end

      begin
        scheduled_template_version =
          TemplateVersioningService.schedule!(
            @requirement_template,
            Date.parse(schedule_params)
          )
      rescue StandardError => e
        # If there is an error in TemplateVersioningService.schedule!, rollback the transaction
        render_error "requirement_template.schedule_error",
                     message_opts: {
                       error_message: e.message
                     }
        raise ActiveRecord::Rollback
      end

      # A reload is required, otherwise the new template version is not ordered correctly
      @requirement_template.reload

      render_success @requirement_template,
                     "requirement_template.schedule_success",
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    end
  end

  def force_publish_now
    authorize @requirement_template

    success = false
    error_message = ""

    published_template_version = nil

    ActiveRecord::Base.transaction do
      unless @requirement_template.update(requirement_template_params)
        error_message = @requirement_template.errors.full_messages.join(", ")
        raise ActiveRecord::Rollback
      end

      begin
        published_template_version =
          TemplateVersioningService.force_publish_now!(@requirement_template)
      rescue StandardError => e
        # If there is an error in TemplateVersioningService.schedule!, rollback the transaction
        error_message = e.message
        raise ActiveRecord::Rollback
      end

      # A reload is required, otherwise the new template version is not ordered correctly
      @requirement_template.reload
      success = true
    end

    if success
      render_success @requirement_template,
                     "requirement_template.force_publish_now_success",
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         published_template_version: published_template_version
                       }
                     }
    else
      render_error "requirement_template.force_publish_now_error",
                   message_opts: {
                     error_message: error_message
                   }
    end
  end

  def unschedule_template_version
    authorize @template_version, policy_class: RequirementTemplatePolicy

    begin
      template_version =
        TemplateVersioningService.unschedule!(@template_version, current_user)
    rescue StandardError => e
      render_error "requirement_template.template_unschedule_error",
                   message_opts: {
                     error_message: e.message
                   }
    end

    render_success @template_version,
                   "requirement_template.template_unschedule_success",
                   { blueprint: TemplateVersionBlueprint }
  end

  def destroy
    authorize @requirement_template
    if @requirement_template.discard
      render_success(
        @requirement_template,
        "requirement_template.destroy_success"
      )
    else
      render_error "requirement_template.destroy_error"
    end
  end

  def restore
    authorize @requirement_template
    if @requirement_template.update(discarded_at: nil)
      render_success(
        @requirement_template,
        "requirement_template.restore_success"
      )
    else
      render_error "requirement_template.restore_error", {}
    end
  end

  private

  def set_requirement_template
    # eager loading of associations as most of the time we return the extended view
    @requirement_template =
      RequirementTemplate.includes(
        :activity,
        :permit_type,
        :published_template_version,
        :last_three_deprecated_template_versions,
        :scheduled_template_versions,
        requirement_template_sections: [
          template_section_blocks: [requirement_block: :requirements]
        ]
      ).find(params[:id])
  end

  def set_template_version
    @template_version = TemplateVersion.find(params[:id])
  end

  def requirement_template_params
    permitted_params =
      params.require(:requirement_template).permit(
        :id,
        :description,
        :nickname,
        :assignee_id,
        :first_nations,
        :activity_id,
        :permit_type_id,
        :type,
        requirement_template_sections_attributes: [
          :id,
          :name,
          :position,
          :_destroy,
          template_section_blocks_attributes: %i[
            id
            requirement_block_id
            position
            _destroy
          ]
        ]
      )

    # This is a workaround needed to validate step code related errors
    if permitted_params[:requirement_template_sections_attributes].present?
      permitted_params[
        :requirement_template_sections_attributes_copy
      ] = permitted_params[
        requirement_template_sections_attributes: :requirements
      ].deep_dup
    end

    permitted_params
  end

  def schedule_params
    params.require(:version_date)
  end
end
