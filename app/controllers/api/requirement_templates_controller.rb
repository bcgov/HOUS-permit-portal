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
                  discard_draft
                  promote_draft
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
    templates = RequirementTemplate.with_published_version.kept
    render_success templates,
                   nil,
                   { blueprint: OptionsBlueprint, view: :default }
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
                     }
      end
      @requirement_template.touch
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

      @requirement_template.touch
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
            )
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
    rescue TemplateVersionDraftError => e
      render_error "requirement_template.create_draft_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def discard_draft
    authorize @requirement_template

    draft_version = @requirement_template.draft_template_version
    if draft_version.blank?
      render_error "requirement_template.no_draft_error" and return
    end

    begin
      TemplateVersioningService.discard_draft!(draft_version)
      @requirement_template.reload

      render_success @requirement_template,
                     "requirement_template.discard_draft_success",
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    rescue TemplateVersionDraftError => e
      render_error "requirement_template.discard_draft_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def promote_draft
    authorize @requirement_template

    draft_version = @requirement_template.draft_template_version
    if draft_version.blank?
      render_error "requirement_template.no_draft_error" and return
    end

    begin
      promoted =
        TemplateVersioningService.promote_draft_to_scheduled!(
          draft_version,
          Date.parse(promote_draft_params[:version_date]),
          change_notes: promote_draft_params[:change_notes],
          change_significance: promote_draft_params[:change_significance]
        )

      # Set notification preferences on the version
      if promote_draft_params[:notification_scope].present?
        promoted.update!(
          notification_scope: promote_draft_params[:notification_scope],
          notified_jurisdiction_ids:
            promote_draft_params[:notified_jurisdiction_ids] || []
        )
      end

      # Optionally promote block changes back to canonical records
      if promote_draft_params[:promote_block_ids].present?
        TemplateVersioningService.promote_block_changes!(
          promoted,
          promote_draft_params[:promote_block_ids]
        )
      end

      # Optionally send advance notice to jurisdictions
      if promote_draft_params[:send_advance_notice]
        NotificationService.publish_version_scheduled_event(promoted)
      end

      @requirement_template.reload

      render_success @requirement_template,
                     "requirement_template.promote_draft_success",
                     {
                       blueprint: RequirementTemplateBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    rescue TemplateVersionDraftError, TemplateVersionScheduleError => e
      render_error "requirement_template.promote_draft_error",
                   message_opts: {
                     error_message: e.message
                   }
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

  def set_requirement_template
    # eager loading of associations as most of the time we return the extended view
    @requirement_template =
      RequirementTemplate.includes(
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
        :available_globally,
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
    params.require(:version_date)
  end

  def draft_params
    params.permit(:assignee_id)
  end

  def promote_draft_params
    params.permit(
      :version_date,
      :change_notes,
      :change_significance,
      :notification_scope,
      :send_advance_notice,
      notified_jurisdiction_ids: [],
      promote_block_ids: []
    )
  end
end
