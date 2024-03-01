class Api::GeocoderController < Api::ApplicationController
  skip_after_action :verify_policy_scoped
  after_action :verify_authorized

  def site_options
    authorize :geocoder, :site_options?
    begin
      if geocoder_params[:address].present?
        wrapper = Wrappers::Geocoder.new
        options = wrapper.site_options(geocoder_params[:address])
        render_success options, nil, { blueprint: OptionBlueprint }
      elsif geocoder_params[:pid].present?
        coordinates = Integrations::LtsaParcelMapBc.new.get_coordinates_by_pid(geocoder_params[:pid])
        wrapper = Wrappers::Geocoder.new
        options = wrapper.site_options(nil, coordinates)
        render_success options, nil, { blueprint: OptionBlueprint }
      end
    rescue StandardError => e
      render_error "geocoder.site_options_error", {}, e and return
    end
  end

  def pids
    authorize :geocoder, :pid?
    begin
      wrapper = Wrappers::Geocoder.new
      pids = wrapper.pids(geocoder_params[:site_id])
      render json: pids, status: :ok
    rescue StandardError => e
      render_error "geocoder.pid_error", {}, e and return
    end
  end

  private

  def geocoder_params
    params.permit(:address, :site_id, :pid)
  end
end
