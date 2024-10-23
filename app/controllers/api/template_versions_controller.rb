class Api::TemplateVersionsController < Api::ApplicationController
  before_action :set_template_version, except: :index

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
    status = params[:status] || "published"
    @template_versions =
      if params[:activity_id].present?
        policy_scope(TemplateVersion)
          .where(activity: { id: params[:activity_id] })
          .order(updated_at: :desc)
          .where(status:)
      else
        policy_scope(TemplateVersion).order(updated_at: :desc).where(status:)
      end

    render_success @template_versions,
                   nil,
                   {
                     blueprint: TemplateVersionBlueprint,
                     blueprint_opts: {
                       view: :extended
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
    elsif copy_customization_params[:from_non_first_nations] &&
          @template_version.first_nations
      requirement_template =
        RequirementTemplate.find_by(
          activity: @template_version.activity,
          permit_type: @template_version.permit_type,
          first_nations: false
        )
      from_template_version = requirement_template.published_template_version
    end

    if from_template_version.nil?
      render_error("misc.not_found_error", status: :not_found) and return
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
  rescue ActiveRecord::RecordNotFound
    render_error("misc.not_found_error", status: :not_found) and return
  end

  def show_integration_mapping
    authorize @template_version, :show?

    @integration_mapping =
      @template_version.integration_mappings.find_by(
        jurisdiction_id: params[:jurisdiction_id]
      )

    authorize @integration_mapping, policy_class: TemplateVersionPolicy

    if @integration_mapping.present?
      render_success @integration_mapping,
                     nil,
                     {
                       blueprint: IntegrationMappingBlueprint,
                       blueprint_opts: {
                         view: :base
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

    csv_data = TemplateExportService.new(@template_version).summary_csv
    send_data csv_data, type: "text/csv"
  end

  def download_customization_csv
    authorize @template_version

    csv_data =
      TemplateExportService.new(
        @template_version,
        @jurisdiction_template_version_customization
      ).to_csv
    send_data csv_data, type: "text/csv"
  end

  def download_customization_json
    authorize @template_version

    json_data =
      TemplateExportService.new(
        @template_version,
        @jurisdiction_template_version_customization
      ).to_json
    send_data json_data, type: "text/plain"
  end

  private

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
        from_non_first_nations
        include_tips
        include_electives
      ]
    )
  end

  def compare_requirements_params
    params.permit(:previous_version_id)
  end

  def set_template_version
    @template_version = TemplateVersion.find(params[:id])
  end

  def set_jurisdiction_template_version_customization
    @jurisdiction_template_version_customization =
      @template_version.jurisdiction_template_version_customizations.find_or_create_by(
        jurisdiction_id: params[:jurisdiction_id],
        sandbox: current_sandbox
      )
  end

  def jurisdiction_template_version_customization_params
    params.require(:jurisdiction_template_version_customization).permit(
      customizations: {
        requirement_block_changes: {
        }
      }
    )
  end
end
