class Wrappers::Geocoder < Wrappers::Base
  # https://openapi.apps.gov.bc.ca/?url=https://raw.githubusercontent.com/bcgov/api-specs/master/geocoder/geocoder-combined.json#/sites/get_addresses__outputFormat_

  def base_url
    ENV["BCGOV_ADDRESS_GEOCODER_URL"]
  end

  def default_headers
    {
      "Content-Type" => "application/json",
      "apiKey" => "#{ENV["BCGOV_ADDRESS_GEOCODER_API_KEY"]}"
    }
  end

  OUTPUT_FORMAT = "json"

  def site_options_raw(address_string)
    site_params = { autoComplete: true, brief: true, maxResults: 10 }
    site_params[:addressString] = address_string if address_string.present?

    get("/addresses.#{OUTPUT_FORMAT}", site_params)
  end

  def site_options(address_string = nil, coordinates = nil)
    site_params = {
      locationDescriptor: "parcelPoint",
      autoComplete: true,
      brief: true,
      maxResults: 10,
      outputSRS: 4326
      # A few more params available for experimentation:
      #   locationDescriptor: "any",
      #   interpolation: "adaptive",
      #   echo: true,
      #   setBack: 0,
      #   provinceCode: "BC"
    }

    site_params[:addressString] = address_string if address_string.present?
    if coordinates.present? && address_string.blank?
      return nearest_options(coordinates.join(","))
    end

    r = get("/addresses.json", site_params)
    filtered_features =
      r["features"].filter do |f|
        %w[CIVIC_NUMBER BLOCK].include?(f["properties"]["matchPrecision"])
      end

    options = []

    filtered_features.each do |site|
      site_id = site["properties"]["siteID"]

      # Add the parent site
      options << option_from_feature(site)

      # Only fetch subsites if we have a valid siteID (CIVIC_NUMBER matches)
      # BLOCK matches have empty siteIDs and represent street blocks, not buildings
      next if site_id.blank?

      # Fetch and add subsites (units/strata lots) if they exist
      begin
        subsites_response = subsites(site_id)
        if subsites_response && subsites_response["features"]
          subsites_response["features"].each do |subsite|
            options << option_from_feature(subsite)
          end
        end
      rescue StandardError => e
        # If subsites call fails, just continue with parent site only
        # Note: BC Geocoder API returns 500 errors for sites without subsites
        # instead of empty arrays, so we silently continue here
        Rails.logger.debug(
          "No subsites found for #{site_id} (this is normal): #{e.message}"
        )
      end
    end

    options
  end

  def nearest_options(coordinates, exclude_units = "true")
    site_params = {
      point: coordinates,
      outputSRS: 4326,
      locationDescriptor: "parcelPoint",
      maxDistance: 50,
      maxResults: 5,
      excludeUnits: exclude_units
    }
    r = get("/sites/near.json", site_params)
    # matchPrecision does not exist on near

    (r["features"].map { |site| option_from_feature(site) })
  end

  def site(site_id)
    get("/sites/#{site_id}.json", { outputSRS: 4326 })
  end

  def parcels(site_id)
    get("/parcels/pids/#{site_id}.json")
  end

  def pids(site_id)
    raw_pids =
      get("/parcels/pids/#{site_id}.json")["pids"]
        .to_s
        .split(/,|\|/)
        .map(&:strip)
        .reject(&:blank?)
    return raw_pids if raw_pids.present?

    pids_from_site_coordinates(site_id)
  end

  def subsites(site_id)
    get("/sites/#{site_id}/subsites.json")
  end

  private

  def pids_from_site_coordinates(site_id)
    coords = coordinates_from_site(site(site_id))
    return [] if coords.blank?

    response =
      Wrappers::LtsaParcelMapBc.new.search_pid_from_coordinates(
        coord_array: coords
      )
    return [] unless response.respond_to?(:success?) && response.success?

    JSON
      .parse(response.body)
      .dig("features")
      &.map { |f| f.dig("attributes", "PID") }
      &.map { |pid| pid.to_s.strip }
      &.reject(&:blank?)
      &.uniq || []
  rescue StandardError
    # ponytail: parcelPoint can miss the titled lot; LTSA/site miss → [] same as today
    []
  end

  def option_from_feature(feature)
    coords = coordinates_from_site(feature)
    option = {
      label: feature.dig("properties", "fullAddress"),
      value: feature.dig("properties", "siteID")
    }
    option[:coordinates] = coords if coords.present?
    option
  end

  def coordinates_from_site(payload)
    return [] unless payload.is_a?(Hash)

    coords =
      payload.dig("features", 0, "geometry", "coordinates") ||
        payload.dig("geometry", "coordinates")
    return [] unless coords.is_a?(Array) && coords.size >= 2

    coords.first(2)
  end
end
