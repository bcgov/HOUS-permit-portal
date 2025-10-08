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
      options << { label: site["properties"]["fullAddress"], value: site_id }

      # Only fetch subsites if we have a valid siteID (CIVIC_NUMBER matches)
      # BLOCK matches have empty siteIDs and represent street blocks, not buildings
      next if site_id.blank?

      # Fetch and add subsites (units/strata lots) if they exist
      begin
        subsites_response = subsites(site_id)
        if subsites_response && subsites_response["features"]
          subsites_response["features"].each do |subsite|
            options << {
              label: subsite["properties"]["fullAddress"],
              value: subsite["properties"]["siteID"]
            }
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

    (
      r["features"].map do |site|
        {
          label: site["properties"]["fullAddress"],
          value: site["properties"]["siteID"]
        }
      end
    )
  end

  def site(site_id)
    get("/sites/#{site_id}.json", { outputSRS: 4326 })
  end

  def parcels(site_id)
    get("/parcels/pids/#{site_id}.json")
  end

  def pids(site_id)
    get("/parcels/pids/#{site_id}.json")["pids"].split(/,|\|/)
  end

  def subsites(site_id)
    get("/sites/#{site_id}/subsites.json")
  end
end
