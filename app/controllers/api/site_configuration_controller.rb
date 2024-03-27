class Api::SiteConfigurationController < Api::ApplicationController
  before_action :set_site_configuration, only: %i[index create]

  skip_after_action :verify_policy_scoped
  after_action :verify_authorized

  def index
    authorize :site_configuration, :index?
    render_success @site_configuration
  end

  def create
    authorize :site_configuration, :create?
    @site_configuration.update(site_configuration_params)
    render_success @site_configuration, "site_configuration.update_success"
  end

  private

  def set_site_configuration
    @site_configuration = SiteConfiguration.instance
  end

  def site_configuration_params
    params.require(:site_configuration).permit(:display_sitewide_message, :sitewide_message)
  end
end
