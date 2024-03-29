class Api::SiteConfigurationController < Api::ApplicationController
  before_action :set_site_configuration, only: %i[show update]

  skip_after_action :verify_policy_scoped
  after_action :verify_authorized

  def show
    authorize :site_configuration, :index?
    if @site_configuration.present?
      return render_success @site_configuration
    else
      return render_error "site_configuration.show_error", {}, nil
    end
  end

  def update
    authorize :site_configuration, :create?
    if @site_configuration.update(site_configuration_params)
      render_success @site_configuration, "site_configuration.update_success"
    else
      return render_error "site_configuration.update_error", {}, nil
    end
  end

  private

  def set_site_configuration
    @site_configuration = SiteConfiguration.instance
  end

  def site_configuration_params
    params.require(:site_configuration).permit(:display_sitewide_message, :sitewide_message)
  end
end
