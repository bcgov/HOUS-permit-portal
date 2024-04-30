class Api::TemplateVersionsController < Api::ApplicationController
  before_action :set_template_version, except: :index

  before_action :set_jurisdiction_template_version_customization,
                only: %i[show_jurisdiction_template_version_cutomization download_csv download_json]

  def index
    @template_versions =
      if params[:activity_id].present?
        policy_scope(TemplateVersion).where(activity: { id: params[:activity_id] }).order(updated_at: :desc)
      else
        policy_scope(TemplateVersion).order(updated_at: :desc)
      end

    render_success @template_versions, nil, { blueprint: TemplateVersionBlueprint, blueprint_opts: { view: :extended } }
  end

  def show
    authorize @template_version

    render_success @template_version, nil, { blueprint: TemplateVersionBlueprint, blueprint_opts: { view: :extended } }
  end

  def show_jurisdiction_template_version_cutomization
    authorize @template_version, :show?

    return head :not_found if @jurisdiction_template_version_customization.blank?

    authorize @jurisdiction_template_version_customization, policy_class: TemplateVersionPolicy

    render_success @jurisdiction_template_version_customization
  end

  def create_or_update_jurisdiction_template_version_cutomization
    authorize @template_version, :show?

    @jurisdiction_template_version_customization =
      @template_version.jurisdiction_template_version_customizations.find_or_initialize_by(
        jurisdiction_id: params[:jurisdiction_id],
      )

    authorize @jurisdiction_template_version_customization, policy_class: TemplateVersionPolicy

    # add a db lock in case multiple reviewers are updating this db row
    @jurisdiction_template_version_customization.with_lock do
      if @jurisdiction_template_version_customization.update(jurisdiction_template_version_customization_params)
        render_success @jurisdiction_template_version_customization,
                       "jurisdiction_template_version_customization.update_success",
                       { blueprint: JurisdictionTemplateVersionCustomizationBlueprint }
      else
        render_error "jurisdiction_template_version_customization.update_error",
                     message_opts: {
                       error_message: @jurisdiction_template_version_customization.errors.full_messages.join(", "),
                     }
      end
    end
  end

  def download_csv
    authorize @template_version, :show?

    return head :not_found if @jurisdiction_template_version_customization.blank?

    authorize @jurisdiction_template_version_customization, policy_class: TemplateVersionPolicy

    csv_data = @jurisdiction_template_version_customization.to_csv
    send_data csv_data, filename: "#{@jurisdiction_template_version_customization.label}.csv", type: "text/csv"
  end

  def download_json
    authorize @template_version, :show?

    return head :not_found if @jurisdiction_template_version_customization.blank?

    authorize @jurisdiction_template_version_customization, policy_class: TemplateVersionPolicy

    json_data = @jurisdiction_template_version_customization.to_json
    send_data json_data, filename: "#{@jurisdiction_template_version_customization.label}.json", type: "text/plain"
  end

  private

  def set_template_version
    @template_version = TemplateVersion.find(params[:id])
  end

  def set_jurisdiction_template_version_customization
    @jurisdiction_template_version_customization =
      @template_version.jurisdiction_template_version_customizations.find_by(jurisdiction_id: params[:jurisdiction_id])
  end

  def jurisdiction_template_version_customization_params
    params.require(:jurisdiction_template_version_customization).permit(
      customizations: {
        requirement_block_changes: {
        },
      },
    )
  end
end
