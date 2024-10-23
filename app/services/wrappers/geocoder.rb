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
    return(
      r["features"]
        .filter do |f|
          %w[CIVIC_NUMBER BLOCK].include?(f["properties"]["matchPrecision"])
        end
        .map do |site|
          {
            label: site["properties"]["fullAddress"],
            value: site["properties"]["siteID"]
          }
        end
    )
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
    #matchPrecision does not exist on near
    return(
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
