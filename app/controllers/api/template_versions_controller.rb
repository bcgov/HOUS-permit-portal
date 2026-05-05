class Api::TemplateVersionsController < Api::ApplicationController
  # Anonymous access is permitted for the public preview endpoints; the
  # TemplateVersionPolicy#show? check still enforces that only publicly
  # previewable drafts are actually visible without a signed-in user.
  skip_before_action :authenticate_user!, only: %i[publicly_previewable show]
  # `publicly_previewable` is a collection action that intentionally returns a
  # hard-coded, non-sensitive filter (draft TVs flagged publicly previewable),
  # so we bypass Pundit's verify_authorized / verify_policy_scoped hooks.
  skip_after_action :verify_authorized, only: :publicly_previewable
  skip_after_action :verify_policy_scoped, only: :publicly_previewable
  before_action :set_template_version, except: %i[index publicly_previewable]

  before_action :set_jurisdiction_template_version_customization,
                only: %i[
                  show_jurisdiction_template_version_customization
                  create_or_update_jurisdiction_template_version_customization
                  promote_jurisdiction_template_version_customization
                  show_integration_mapping
                  download_customization_csv
                  download_customization_json
                ]

  def index
    status = template_version_params[:status] || "published"
    @template_versions =
      policy_scope(TemplateVersion)
        .order(updated_at: :desc)
        .joins(:requirement_template)
        .where(status:)

    render_success @template_versions,
                   nil,
                   {
                     blueprint: TemplateVersionBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  # Public landing-page endpoint: returns the set of draft TemplateVersions
  # marked as publicly previewable, for the /standardization-preview page.
  def publicly_previewable
    @template_versions =
      TemplateVersion
        .where(publicly_previewable: true, status: :draft)
        .joins(:requirement_template)
        .includes(:requirement_template)
        .where(requirement_templates: { discarded_at: nil })
        .order(updated_at: :desc)

    render_success @template_versions,
                   nil,
                   {
                     blueprint: TemplateVersionBlueprint,
                     blueprint_opts: {
                       view: :standardization_preview
                     }
                   }
  end

  def show
    authorize @template_version

    render_success @template_version,
                   nil,
                   {
                     blueprint: TemplateVersionBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  def show_jurisdiction_template_version_customization
    authorize @template_version, :show?

    if @jurisdiction_template_version_customization.blank?
      return head :not_found
    end

    authorize @jurisdiction_template_version_customization,
              policy_class: TemplateVersionPolicy

    render_success @jurisdiction_template_version_customization
  end

  def create_or_update_jurisdiction_template_version_customization
    authorize @template_version, :show?

    authorize @jurisdiction_template_version_customization,
              policy_class: TemplateVersionPolicy

    # add a db lock in case multiple reviewers are updating this db row
    @jurisdiction_template_version_customization.with_lock do
      if @jurisdiction_template_version_customization.update(
           jurisdiction_template_version_customization_params
         )
        render_success @jurisdiction_template_version_customization,
                       "jurisdiction_template_version_customization.update_success",
                       {
                         blueprint:
                           JurisdictionTemplateVersionCustomizationBlueprint
                       }
      else
        render_error "jurisdiction_template_version_customization.update_error",
                     message_opts: {
                       error_message:
                         @jurisdiction_template_version_customization
                           .errors
                           .full_messages
                           .join(", ")
                     }
      end
    end
  end

  def promote_jurisdiction_template_version_customization
    authorize @template_version, :show?

    authorize @jurisdiction_template_version_customization,
              policy_class: TemplateVersionPolicy

    # add a db lock in case multiple reviewers are updating this db row
    @jurisdiction_template_version_customization.with_lock do
      if @jurisdiction_template_version_customization.promote
        render_success @jurisdiction_template_version_customization,
                       "jurisdiction_template_version_customization.promote_success",
                       {
                         blueprint:
                           JurisdictionTemplateVersionCustomizationBlueprint
                       }
      else
        render_error "jurisdiction_template_version_customization.promote_error",
                     message_opts: {
                       error_message:
                         @jurisdiction_template_version_customization
                           .errors
                           .full_messages
                           .join(", ")
                     }
      end
    end
  end

  def copy_jurisdiction_template_version_customization
    authorize @template_version
    if copy_customization_params[:from_template_version_id]
      from_template_version =
        TemplateVersion.find(
          copy_customization_params[:from_template_version_id]
        )
    end

    if from_template_version.nil?
      render_error(
        "jurisdiction_template_version_customization.no_copy_target_error",
        status: :not_found
      ) and return
    end

    if @jurisdiction_template_version_customization =
         # TODO: TEST COPY SERVICE
         CustomizationCopyService.new(
           from_template_version,
           @template_version,
           Jurisdiction.find(copy_customization_params[:jurisdiction_id]),
           current_sandbox
         ).merge_copy_customizations(
           copy_customization_params[:include_electives],
           copy_customization_params[:include_tips]
         )
      render_success @jurisdiction_template_version_customization,
                     "jurisdiction_template_version_customization.copy_success",
                     {
                       blueprint:
                         JurisdictionTemplateVersionCustomizationBlueprint
                     }
    else
      render_error "jurisdiction_template_version_customization.update_error",
                   message_opts: {
                     error_message:
                       @jurisdiction_template_version_customization
                         .errors
                         .full_messages
                         .join(", ")
                   }
    end
  rescue ActiveRecord::RecordNotFound
    render_error("misc.not_found_error", status: :not_found) and return
  end

  def show_integration_mapping
    authorize @template_version, :show?

    @integration_mapping =
      IntegrationMapping.find_or_create_by!(
        template_version_id: @template_version.id,
        jurisdiction_id: params[:jurisdiction_id]
      )

    authorize @integration_mapping, policy_class: TemplateVersionPolicy

    if @integration_mapping.present?
      render_success @integration_mapping,
                     nil,
                     {
                       blueprint: IntegrationMappingBlueprint,
                       blueprint_opts: {
                         view: :base,
                         sandbox: current_sandbox
                       }
                     }
    else
      render_error "integration_mapping.not_found_error", status: 404
    end
  end

  def compare_requirements
    authorize @template_version
    before_version =
      TemplateVersion.find(
        compare_requirements_params[:previous_version_id]
      ) if compare_requirements_params[:previous_version_id].present?

    render_success @template_version.compare_requirements(before_version),
                   nil,
                   { blueprint: CompareRequirementsBlueprint }
  end

  def download_summary_csv
    authorize @template_version

    csv_data = TemplateReportingService.new(@template_version).summary_csv
    send_data csv_data, type: "text/csv"
  end

  def download_customization_csv
    authorize @template_version

    csv_data =
      TemplateReportingService.new(
        @template_version,
        @jurisdiction_template_version_customization
      ).to_csv
    send_data csv_data, type: "text/csv"
  end

  def download_customization_json
    authorize @template_version

    json_data =
      TemplateReportingService.new(
        @template_version,
        @jurisdiction_template_version_customization
      ).to_json
    send_data json_data, type: "text/plain"
  end

  # ── Draft-specific actions ────────────────────────────────────────────

  def update_draft_block
    authorize @template_version, :update?

    begin
      TemplateVersioningService.update_draft_block!(
        @template_version,
        draft_block_params[:block_id],
        draft_block_params[:block_data].to_unsafe_h
      )

      render_success @template_version,
                     "template_version.update_draft_block_success",
                     {
                       blueprint: TemplateVersionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    rescue TemplateVersionDraftError => e
      render_error "template_version.update_draft_block_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def refresh_draft
    authorize @template_version, :update?

    begin
      TemplateVersioningService.refresh_draft_snapshot!(@template_version)

      render_success @template_version,
                     "template_version.refresh_draft_success",
                     {
                       blueprint: TemplateVersionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    rescue TemplateVersionDraftError => e
      render_error "template_version.refresh_draft_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def share_draft
    authorize @template_version, :update?

    unless @template_version.draft?
      render_error "template_version.not_draft_error" and return
    end

    previewer_count = @template_version.template_version_previews.kept.count
    if previewer_count.zero?
      render_error "template_version.no_previewers_error" and return
    end

    NotificationService.publish_draft_shared_event(@template_version)

    render_success @template_version,
                   "template_version.share_draft_success",
                   {
                     message_opts: {
                       count: previewer_count
                     },
                     blueprint: TemplateVersionBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  def invite_draft_previewers
    authorize @template_version, :update?

    unless @template_version.draft?
      render_error "template_version.not_draft_error" and return
    end

    if draft_previewer_params[:emails].blank?
      render_error "template_version.invite_previewers_error" and return
    end

    service = TemplateVersionPreview::ManagementService.new(@template_version)
    result = service.invite_previewers!(draft_previewer_params[:emails])

    render_success @template_version,
                   "template_version.invite_previewers_success",
                   {
                     blueprint: TemplateVersionBlueprint,
                     blueprint_opts: {
                       view: :extended
                     },
                     meta: result
                   }
  end

  def toggle_publicly_previewable
    authorize @template_version, :update?

    unless @template_version.draft?
      render_error "template_version.not_draft_error" and return
    end

    if @template_version.update(
         publicly_previewable: toggle_publicly_previewable_params
       )
      render_success @template_version,
                     "template_version.toggle_publicly_previewable_success",
                     {
                       blueprint: TemplateVersionBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "template_version.toggle_publicly_previewable_error",
                   message_opts: {
                     error_message:
                       @template_version.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def template_version_params
    params.permit(:status)
  end

  def template_version_sandbox_scope
    if user.super_admin?
      TemplateVersion
    elsif user.review_manager? || user.regional_review_manager?
      if sandbox&.template_version_status_scope.present?
        TemplateVersion.by_status(sandbox.template_version_status_scope)
      else
        TemplateVersion
      end
    else
      template_versions.by_status("published")
    end
  end

  def copy_customization_params
    params.permit(
      %i[
        template_version_id
        jurisdiction_id
        from_template_version_id
        include_tips
        include_electives
      ]
    )
  end

  def compare_requirements_params
    params.permit(:previous_version_id)
  end

  def set_template_version
    @template_version =
      TemplateVersion.for_sandbox(current_sandbox).find(params[:id])
  end

  def set_jurisdiction_template_version_customization
    @jurisdiction_template_version_customization =
      @template_version
        .jurisdiction_template_version_customizations
        .for_sandbox(current_sandbox)
        .find_or_create_by(
          jurisdiction_id: params[:jurisdiction_id],
          sandbox: current_sandbox
        )
  end

  def jurisdiction_template_version_customization_params
    params.require(:jurisdiction_template_version_customization).permit(
      :disabled,
      customizations: {
        requirement_block_changes: {
        }
      }
    )
  end

  def draft_block_params
    params.permit(:block_id, block_data: {})
  end

  def draft_previewer_params
    params.permit(emails: [])
  end

  def toggle_publicly_previewable_params
    # Accept either { template_version: { publicly_previewable: ... } } or a
    # bare top-level :publicly_previewable param for flexibility.
    raw =
      if params[:template_version].present?
        params.require(:template_version).permit(:publicly_previewable)[
          :publicly_previewable
        ]
      else
        params.permit(:publicly_previewable)[:publicly_previewable]
      end
    ActiveModel::Type::Boolean.new.cast(raw)
  end
end
