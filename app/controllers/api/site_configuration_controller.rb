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
      return(
        render_error(
          "site_configuration.update_error",
          message_opts: {
            error_message: @site_configuration.errors.full_messages.join(", ")
          }
        )
      )
    end
  end

  private

  def set_site_configuration
    @site_configuration = SiteConfiguration.instance
  end

  def site_configuration_params
    params.require(:site_configuration).permit(
      :display_sitewide_message,
      :sitewide_message,
      :small_scale_requirement_template_id,
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
