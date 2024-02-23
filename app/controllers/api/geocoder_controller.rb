class Api::GeocoderController < Api::ApplicationController
  skip_after_action :verify_policy_scoped
  after_action :verify_authorized

  def site_options
    authorize :geocoder, :site_options?
    begin
      wrapper = Wrappers::Geocoder.new
      options = wrapper.site_options(geocoder_params[:address])
      render_success options, nil, { blueprint: OptionBlueprint }
    rescue StandardError => e
      render_error "geocoder.site_options_error" and return
    end
  end

  def pids
    authorize :geocoder, :pid?
    begin
      wrapper = Wrappers::Geocoder.new
      pids = wrapper.pids(geocoder_params[:site_id])
      render json: pids, status: :ok
    rescue StandardError => e
      render_error "geocoder.pid_error" and return
    end
  end

  private

  def geocoder_params
    params.permit(:address, :site_id)
  end
end
