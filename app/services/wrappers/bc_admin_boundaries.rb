# frozen_string_literal: true

class Wrappers::BcAdminBoundaries < Wrappers::Base
  # BC Government ArcGIS Admin Boundaries service
  # https://delivery.maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_legal_admin_boundaries/MapServer

  MUNICIPALITIES_LAYER = 18
  REGIONAL_DISTRICTS_LAYER = 16

  def base_url
    ENV["GEO_BC_ADMIN_BOUNDARIES_REST_URL"]
  end

  def default_headers
    { "Content-Type" => "application/json" }
  end

  # Fetch polygon geometry for a feature matching a search term on the given layer.
  # Returns the raw geometry hash (with "rings" key) in WGS84 (outSR=4326), or nil.
  #
  # The search term is split on whitespace and joined with SQL % wildcards so that
  # separators (spaces, hyphens, etc.) in ADMIN_AREA_NAME are matched flexibly.
  # e.g. "Columbia Shuswap" matches "Columbia-Shuswap Regional District".
  def fetch_feature_geometry(layer_id:, search_term:)
    escaped_term = search_term.gsub("'", "''")
    fuzzy_term = escaped_term.strip.split(/\s+/).join("%")

    response =
      get(
        "#{layer_id}/query",
        {
          f: "json",
          where: "ADMIN_AREA_NAME LIKE '%#{fuzzy_term}%'",
          returnGeometry: true,
          outSR: 4326,
          outFields: "ADMIN_AREA_NAME",
          resultRecordCount: 1
        },
        true # skip_handle_response — we parse manually
      )

    return nil unless response.success?

    parsed = JSON.parse(response.body)
    parsed.dig("features", 0, "geometry")
  end

  # Convenience: fetch geometry for a municipality by name
  def municipality_geometry(search_term)
    fetch_feature_geometry(
      layer_id: MUNICIPALITIES_LAYER,
      search_term: search_term
    )
  end

  # Convenience: fetch geometry for a regional district by name
  def regional_district_geometry(search_term)
    fetch_feature_geometry(
      layer_id: REGIONAL_DISTRICTS_LAYER,
      search_term: search_term
    )
  end
end
