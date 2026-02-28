class Api::GeocoderController < Api::ApplicationController
  skip_after_action :verify_policy_scoped
  after_action :verify_authorized
  skip_before_action :authenticate_user!, only: %i[site_options jurisdiction]

  def site_options
    authorize :geocoder, :site_options?
    begin
      if geocoder_params[:address].present?
        wrapper = Wrappers::Geocoder.new
        options = wrapper.site_options(geocoder_params[:address])
        render_success options, nil, { blueprint: OptionBlueprint }
      else
        render_success [], nil, { blueprint: OptionBlueprint }
      end
    rescue StandardError => e
      render_error "geocoder.site_options_error", {}, e and return
    end
  end

  def pid_details #get site details if a pid is supplied instead
    authorize :geocoder, :pid_details?
    begin
      result =
        Wrappers::LtsaParcelMapBc.new.get_coordinates_by_pid(
          geocoder_params[:pid]
        )
      if result
        coordinates = result[:centroid]
        wrapper = Wrappers::Geocoder.new

        options = wrapper.site_options(nil, coordinates)
        options.each do |option|
          if wrapper.pids(option[:value]).include?(geocoder_params[:pid])
            render_success option, nil, { blueprint: OptionBlueprint }
            return
          end
        end
      end
      #for options that come back, check if there are pids against that site
      #if the pid matches, get the addsress string and return, else nothing

      render_success nil, nil, { blueprint: OptionBlueprint }
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

  def jurisdiction
    authorize :geocoder, :jurisdiction?
    begin
      wrapper = Wrappers::Geocoder.new
      if geocoder_params[:site_id].present?
        pids = wrapper.pids(geocoder_params[:site_id])
        pid = pids.first
      elsif geocoder_params[:pid].present?
        pid = geocoder_params[:pid]
      end
      raise StandardError unless pid.present?

      attributes =
        Wrappers::LtsaParcelMapBc.new.get_feature_attributes_by_pid(pid: pid)
      ltsa_matcher = Jurisdiction.ltsa_matcher_from_ltsa_attributes(attributes)
      jurisdiction =
        Jurisdiction.fuzzy_find_by_ltsa_feature_attributes(attributes)
      raise StandardError unless jurisdiction.present?

      render_success jurisdiction,
                     nil,
                     {
                       blueprint: JurisdictionBlueprint,
                       blueprint_opts: {
                         view: :base
                       },
                       meta:
                         (
                           if include_ltsa_matcher?
                             { ltsa_matcher: ltsa_matcher }
                           else
                             {}
                           end
                         )
                     }
    rescue Errors::FeatureAttributesRetrievalError => e
      render_error "geocoder.ltsa_retrieval_error", {}, e and return
    rescue Errors::LtsaUnavailableError => e
      render_error "geocoder.ltsa_unavailable_error", {}, e and return
    rescue StandardError => e
      if include_ltsa_matcher? && ltsa_matcher.present?
        render json: {
                 data: nil,
                 meta: {
                   ltsa_matcher: ltsa_matcher
                 }
               },
               status: :ok and return
      end

      render_error "geocoder.jurisdiction_error", {}, e and return
    end
  end

  def form_bc_addresses
    authorize :geocoder, :form_bc_addresses?
    begin
      wrapper = Wrappers::Geocoder.new
      addresses =
        wrapper.site_options_raw(form_bc_address_params[:addressString])
      render json: addresses, status: :ok
    rescue StandardError => e
      render_error "geocoder.general_error", {}, e and return
    end
  end

  def pin
    authorize :geocoder, :pin?
    begin
      attributes =
        Wrappers::LtsaParcelMapBc.new.get_feature_attributes_by_pid_or_pin(
          pin: pin_params[:pin],
          pid: nil
        )
      render json: { pin: attributes }, status: :ok
    rescue Errors::FeatureAttributesRetrievalError => e
      render_error "geocoder.pin_retrieval_error", {}, e and return
    rescue StandardError => e
      render_error "geocoder.ltsa_unavailable_error", {}, e and return
    end
  end

  private

  def geocoder_params
    params.permit(:address, :site_id, :pid, :coordinates, :include_ltsa_matcher)
  end

  def include_ltsa_matcher?
    ActiveModel::Type::Boolean.new.cast(geocoder_params[:include_ltsa_matcher])
  end

  def pin_params
    params.permit(:pin)
  end

  def form_bc_address_params
    params.permit(:addressString)
  end
end
