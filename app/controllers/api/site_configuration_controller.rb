class Api::SiteConfigurationController < Api::ApplicationController
  before_action :set_site_configuration, only: %i[show update]
  skip_after_action :verify_authorized, only: %i[show]
  skip_before_action :authenticate_user!, only: %i[show]
  skip_before_action :require_confirmation, only: %i[show]

  def show
    authorize :site_configuration, :show?
    if @site_configuration.present?
      return render_success @site_configuration
    else
      return render_error "site_configuration.show_error", {}, nil
    end
  end

  def update
    authorize :site_configuration, :update?

    if @site_configuration.update(site_configuration_params)
      render_success @site_configuration, "site_configuration.update_success"
    else
      render_error(
        "site_configuration.update_error",
        message_opts: {
          error_message: @site_configuration.errors.full_messages.join(", ")
        }
      )
    end
  end

  def update_jurisdiction_enrollments
    authorize :site_configuration, :update_jurisdiction_enrollments?

    service_partner = params[:service_partner]
    jurisdiction_ids = params[:jurisdiction_ids] || []

    # Remove enrollments not in the list
    JurisdictionServicePartnerEnrollment
      .where(service_partner: service_partner)
      .where.not(jurisdiction_id: jurisdiction_ids)
      .destroy_all

    # Add new enrollments
    jurisdiction_ids.each do |jurisdiction_id|
      JurisdictionServicePartnerEnrollment.find_or_create_by!(
        jurisdiction_id: jurisdiction_id,
        service_partner: service_partner
      )
    end

    # Return enrolled jurisdictions with their data
    enrollments =
      JurisdictionServicePartnerEnrollment.where(
        service_partner: service_partner
      ).includes(:jurisdiction)

    render_success(
      enrollments,
      "site_configuration.enrollments_updated",
      { blueprint: JurisdictionServicePartnerEnrollmentBlueprint }
    )
  end

  def jurisdiction_enrollments
    authorize :site_configuration, :jurisdiction_enrollments?
    service_partner = jurisdiction_enrollments_params[:service_partner]
    enrollments =
      JurisdictionServicePartnerEnrollment.where(
        service_partner: service_partner
      ).includes(:jurisdiction)

    render_success(
      enrollments,
      nil,
      { blueprint: JurisdictionServicePartnerEnrollmentBlueprint }
    )
  end

  private

  def set_site_configuration
    @site_configuration = SiteConfiguration.instance
  end

  def jurisdiction_enrollments_params
    params.permit(:service_partner)
  end

  def site_configuration_params
    params.require(:site_configuration).permit(
      :display_sitewide_message,
      :sitewide_message,
      :inbox_enabled,
      :allow_designated_reviewer,
      :code_compliance_enabled,
      :archistar_enabled_for_all_jurisdictions,
      standardization_page_early_access_requirement_template_ids: [],
      help_link_items: [
        get_started_link_item: %i[href title description show],
        best_practices_link_item: %i[href title description show],
        dictionary_link_item: %i[href title description show],
        user_guide_link_item: %i[href title description show]
      ],
      revision_reasons_attributes: %i[id description reason_code _discard]
    )
  end
end
