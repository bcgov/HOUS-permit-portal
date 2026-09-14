class Api::RequirementTemplatesController < Api::ApplicationController
  include Api::Concerns::Search::RequirementTemplates
  before_action :set_requirement_template,
                only: %i[
                  show
                  destroy
                  restore
                  update
                  schedule
                  force_publish_now
                  create_draft
                  validate_config
                  update_jurisdiction_availabilities
                ]
  before_action :set_template_version, only: %i[unschedule_template_version]
  skip_after_action :verify_policy_scoped, only: [:index]
  skip_before_action :authenticate_user!, only: [:show]

  def index
    perform_search
    authorized_results = apply_search_authorization(@search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: page_meta(@search),
                     blueprint: RequirementTemplateBlueprint,
                     blueprint_opts: {
                       current_user: current_user
                     }
                   }
  end

  def for_filter
    authorize :requirement_template, :for_filter?
    templates = filter_requirement_templates
    render_success templates, nil, { blueprint: OptionsBlueprint }
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
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
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
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
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
      @requirement_template.touch
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
                     },
                     log_args: {
                       errors: @requirement_template.errors.full_messages
                     }
      end
      @requirement_template.touch
      begin
        TemplateVersioningService.schedule!(
          @requirement_template,
          Date.parse(schedule_params[:version_date]),
          change_notes: schedule_params[:change_notes]
        )
      rescue TemplateVersionConfigError => e
        render_template_config_error(e)
        raise ActiveRecord::Rollback
      rescue StandardError => e
        # If there is an error in TemplateVersioningService.schedule!, rollback the transaction
        render_error "requirement_template.schedule_error",
                     message_opts: {
                       error_message: e.message
                     },
                     log_args: {
                       errors: e.message
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
                         view: :extended,
                         current_user: current_user
                       }
                     }
    end
  end

  def force_publish_now
    authorize @requirement_template

    success = false
    error_message = ""

    published_template_version = nil
    config_error = nil

    ActiveRecord::Base.transaction do
      unless @requirement_template.update(requirement_template_params)
        error_message = @requirement_template.errors.full_messages.join(", ")
        raise ActiveRecord::Rollback
      end

      @requirement_template.touch
      begin
        published_template_version =
          TemplateVersioningService.force_publish_now!(
            @requirement_template,
            change_notes: force_publish_params[:change_notes]
          )
      rescue TemplateVersionConfigError => e
        config_error = e
        raise ActiveRecord::Rollback
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
                         published_template_version: published_template_version,
                         current_user: current_user
                       }
                     }
    elsif config_error
      render_template_config_error(config_error)
    else
      render_error "requirement_template.force_publish_now_error",
                   message_opts: {
                     error_message: error_message
                   },
                   log_args: {
                     errors: [error_message]
                   }
    end
  end

  def unschedule_template_version
    authorize @template_version, policy_class: RequirementTemplatePolicy

    begin
      TemplateVersioningService.unschedule!(@template_version, current_user)
    rescue StandardError => e
      render_error "requirement_template.template_unschedule_error",
                   log_args: {
                     errors: e.message
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

  # ── Draft workflow actions ────────────────────────────────────────────

  def create_draft
    authorize @requirement_template

    begin
      draft_version =
        TemplateVersioningService.create_draft!(
          @requirement_template,
          assignee:
            (
              if draft_params[:assignee_id].present?
                User.find(draft_params[:assignee_id])
              else
                nil
              end
            ),
          change_notes: draft_params[:change_notes]
        )

      @requirement_template.reload

      render_success @requirement_template,
                     "requirement_template.create_draft_success",
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    rescue TemplateVersionConfigError => e
      render_template_config_error(e)
    rescue TemplateVersionDraftError => e
      render_error "requirement_template.create_draft_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def validate_config
    authorize @requirement_template

    begin
      TemplateVersioningService.validate_requirement_template!(
        @requirement_template
      )
      render_success nil, nil, { meta: { config_errors: [] } }
    rescue TemplateVersionConfigError => e
      render_template_config_error(e)
    end
  end

  def update_jurisdiction_availabilities
    authorize @requirement_template

    jurisdiction_ids = params[:jurisdiction_ids] || []

    # Remove availabilities not in the list
    JurisdictionRequirementTemplate
      .where(requirement_template: @requirement_template)
      .where.not(jurisdiction_id: jurisdiction_ids)
      .destroy_all

    # Add new availabilities
    jurisdiction_ids.each do |jurisdiction_id|
      JurisdictionRequirementTemplate.find_or_create_by!(
        jurisdiction_id: jurisdiction_id,
        requirement_template: @requirement_template
      )
    end

    # Reload association
    @requirement_template.reload

    render_success @requirement_template,
                   "requirement_template.update_success",
                   {
                     blueprint: RequirementTemplateBlueprint,
                     blueprint_opts: {
                       view: :extended,
                       current_user: current_user
                     }
                   }
  end

  private

  def render_template_config_error(error)
    render_error nil,
                 {
                   meta: {
                     config_errors: error.config_errors
                   },
                   log_args: {
                     errors: error.message
                   }
                 }
  end

  def set_requirement_template
    # eager loading of associations as most of the time we return the extended view
    @requirement_template =
      RequirementTemplate.includes(
        :published_template_version,
        :draft_template_versions,
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

  def filter_requirement_templates
    apps =
      policy_scope(
        PermitApplication.kept.joins(
          :permit_project,
          template_version: :requirement_template
        )
      )

    if params[:jurisdiction_id].present?
      jurisdiction = Jurisdiction.friendly.find(params[:jurisdiction_id])
      authorize jurisdiction, :search_permit_applications?
      apps = apps.where(permit_projects: { jurisdiction_id: jurisdiction.id })
    end

    if params[:permit_project_id].present?
      project = PermitProject.find(params[:permit_project_id])
      authorize project, :show?
      apps = apps.where(permit_project_id: project.id)
    end

    RequirementTemplate.where(id: apps.select("requirement_templates.id"))
  end

  def requirement_template_params
    permitted_params =
      params.require(:requirement_template).permit(
        :id,
        :description,
        :nickname,
        :available_globally,
        :template_category_id,
        :sort_order,
        tag_list: [],
        requirement_template_sections_attributes: [
          :id,
          :name,
          :position,
          :_destroy,
          template_section_blocks_attributes: [
            :id,
            :requirement_block_id,
            :position,
            :_destroy,
            conditional: %i[
              when_block_id
              when_requirement_code
              operator
              eq
              show
              hide
            ]
          ]
        ]
      )

    restore_cleared_block_conditionals(permitted_params)

    # This is a workaround needed to validate Step Code related errors
    if permitted_params[:requirement_template_sections_attributes].present?
      permitted_params[
        :requirement_template_sections_attributes_copy
      ] = permitted_params[
        requirement_template_sections_attributes: :requirements
      ].deep_dup
    end

    permitted_params
  end

  # Rails permit strips `conditional: null` because it expects a hash.
  # Re-inject nil so the model clears the column on save.
  def restore_cleared_block_conditionals(permitted_params)
    permitted_params[
      :requirement_template_sections_attributes
    ]&.each_with_index do |section, si|
      section[:template_section_blocks_attributes]&.each_with_index do |tsb, bi|
        raw_tsb =
          params.dig(
            :requirement_template,
            :requirement_template_sections_attributes,
            si,
            :template_section_blocks_attributes,
            bi
          )
        tsb[:conditional] = nil if raw_tsb&.key?(:conditional) &&
          raw_tsb[:conditional].nil?
      end
    end
  end

  def schedule_params
    params
      .permit(:version_date, :change_notes)
      .tap { |permitted| permitted.require(:version_date) }
  end

  def force_publish_params
    params.permit(:change_notes)
  end

  def draft_params
    params.permit(:assignee_id, :change_notes)
  end
end
