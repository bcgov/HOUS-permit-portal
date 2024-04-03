class Wrappers::Geocoder < Wrappers::Base
  # https://openapi.apps.gov.bc.ca/?url=https://raw.githubusercontent.com/bcgov/api-specs/master/geocoder/geocoder-combined.json#/sites/get_addresses__outputFormat_

  def base_url
    ENV["BCGOV_ADDRESS_GEOCODER_URL"]
  end

  def default_headers
    { "Content-Type" => "application/json", "apiKey" => "#{ENV["BCGOV_ADDRESS_GEOCODER_API_KEY"]}" }
  end

  OUTPUT_FORMAT = "json"

  def site_options(address_string = nil, coordinates = nil)
    site_params = {
      locationDescriptor: "parcelPoint",
      autoComplete: true,
      brief: true,
      maxResults: 10,
      outputSRS: 4326,
      # A few more params available for experimentation:
      #   locationDescriptor: "any",
      #   interpolation: "adaptive",
      #   echo: true,
      #   setBack: 0,
      #   provinceCode: "BC"
    }

    site_params[:addressString] = address_string if address_string.present?
    site_params[:parcelPoint] = coordinates.join(",") if coordinates.present?

    r = get("/addresses.#{OUTPUT_FORMAT}", site_params)
    return(
      r["features"]
        .filter { |f| %w[CIVIC_NUMBER BLOCK].include?(f["properties"]["matchPrecision"]) }
        .map { |site| { label: site["properties"]["fullAddress"], value: site["properties"]["siteID"] } }
    )
  end

  def site(site_id)
    get("/sites/#{site_id}.#{OUTPUT_FORMAT}", { outputSRS: 4326 })
  end

  def parcels(site_id)
    get("/parcels/pids/#{site_id}.#{OUTPUT_FORMAT}")
  end

  def pids(site_id)
    get("/parcels/pids/#{site_id}.#{OUTPUT_FORMAT}")["pids"].split(/,|\|/)
  end

  def subsites(site_id)
    get("/sites/#{site_id}/subsites.#{OUTPUT_FORMAT}")
  end
end
