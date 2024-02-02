class Wrappers::Geocoder < Wrappers::Base
  # https://openapi.apps.gov.bc.ca/?url=https://raw.githubusercontent.com/bcgov/api-specs/master/geocoder/geocoder-combined.json#/sites/get_addresses__outputFormat_

  def base_url
    ENV["BCGOV_ADDRESS_GEOCODER_URL"]
  end

  def default_headers
    { "Content-Type" => "application/json", "apiKey" => "#{ENV["BCGOV_ADDRESS_GEOCODER_API_KEY"]}" }
  end

  OUTPUT_FORMAT = "json"

  def site_options(address_string)
    r =
      get(
        "/addresses.#{OUTPUT_FORMAT}",
        {
          # addressString: "525 Superior Street, Victoria, BC"
          addressString: address_string,
          locationDescriptor: "parcelPoint",
          autoComplete: true,
          brief: true,
          maxResults: 10,
        },
      )
    return(
      r["features"]
        .filter { |f| f["properties"]["siteID"].present? }
        .map { |site| { label: site["properties"]["fullAddress"], value: site["properties"]["siteID"] } }
    )
  end

  def site(site_id)
    get("/sites/#{site_id}.#{OUTPUT_FORMAT}")
  end

  def parcels(site_id)
    get("/parcels/pids/#{site_id}.#{OUTPUT_FORMAT}")
  end

  def pid(site_id)
    get("/parcels/pids/#{site_id}.#{OUTPUT_FORMAT}")["pids"]
  end

  def subsites(site_id)
    get("/sites/#{site_id}/subsites.#{OUTPUT_FORMAT}")
  end
end
