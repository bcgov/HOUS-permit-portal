class Wrappers::LtsaParcelMapBc < Wrappers::Base
  PARCEL_SERVICE = "whse/bcgw_pub_whse_cadastre/MapServer/0"
  HISTORIC_SERVICE = "whse/bcgw_pub_whse_human_cultural_economic/MapServer/1"
  IMAP_SERVICE = "mpcm/bcgw/MapServer/dynamicLayer"

  def base_url
    ENV["GEO_LTSA_PARCELMAP_REST_URL"]
  end

  def default_headers
    { "Content-Type" => "application/json" }
  end

  def get_details_by_pid(pid:, fields: "*")
    query_params = {
      f: "json",
      returnIdsOnly: false,
      returnCountOnly: false,
      where: "PID='#{pid}'",
      returnGeometry: true,
      spatialRel: "esriSpatialRelIntersects",
      outFields: fields,
    }

    get("#{PARCEL_SERVICE}/query", query_params, true)
  end

  def get_details_by_pin(pin:, fields: "*")
    query_params = {
      f: "json",
      returnIdsOnly: false,
      returnCountOnly: false,
      where: "PARCEL_NAME='#{pin}' AND PIN IS NOT NULL",
      returnGeometry: true,
      spatialRel: "esriSpatialRelIntersects",
      outFields: fields,
    }

    get("#{PARCEL_SERVICE}/query", query_params, true)
  end

  def historic_site_by_pid(pid:)
    query_params = {
      f: "json",
      where: "HISTORIC_SITE_IND='Y' AND PARCEL_DESCRIPTION='#{pid}'",
      returnGeometry: true,
      outFields: "*",
    }
    response = get("#{HISTORIC_SERVICE}/query", query_params, true)

    # Assume if there is a parcel description match not to use LTSA geometry matching
    if response.success? && JSON.parse(response.body).dig("features").length > 0
      return parse_attributes_from_response(response)
    end

    # Get geometry from PID
    response_for_geometry = get_details_by_pid(pid: pid, fields: "PID")
    if response_for_geometry.success? && JSON.parse(response_for_geometry.body).dig("features", 0, "geometry")
      # Intersect the geometry from the city over
      pid_geo = JSON.parse(response_for_geometry.body).dig("features", 0, "geometry")
      pid_geo_query_params = {
        f: "json",
        where: "HISTORIC_SITE_IND='Y'",
        returnGeometry: true,
        spatialRel: "esriSpatialRelIntersects",
        geometry: pid_geo.to_json,
        geometryType: "esriGeometryPolygon",
        outFields: "*",
      }

      pid_geo_response = get("#{HISTORIC_SERVICE}/query", pid_geo_query_params, true)
      return parse_attributes_from_response(pid_geo_response)
    else
      raise Errors::GeometryError
    end
  end

  def get_dynamic_features_by_pid(pid:)
    #call the get_details_by_pid to get the active polygon for the parcel
    query_params = { f: "json", returnIdsOnly: false, returnCountOnly: false }

    get("#{PARCEL_SERVICE}/query", query_params, true)

    # https://maps.gov.bc.ca/arcserver/rest/services/mpcm/bcgw/MapServer/dynamicLayer/query?layer=Your_Layer_Definition&f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry={"rings":[[[x1, y1], [x2, y2], [x3, y3], ..., [x1, y1]]],"spatialReference":{"wkid":Spatial_Reference_ID}}&geometryType=esriGeometryPolygon&inSR=Spatial_Reference_ID&outSR=Spatial_Reference_ID
  end

  def get_feature_attributes_by_pid(pid:, fields: "*")
    response = get_details_by_pid(pid: pid, fields: fields)
    if response.success?
      return parse_attributes_from_response(response)
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def get_feature_attributes_by_pid_or_pin(pid:, pin:, fields: "*")
    raise Errors::FeatureAttributesRetrievalError if pin.blank? && pid.blank?
    #always prioritize pid over pin
    response =
      if pid
        get_details_by_pid(pid: pid, fields: fields)
      elsif pin
        get_details_by_pin(pin: pin, fields: fields)
      end
    if response.success?
      return parse_attributes_from_response(response)
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def get_coordinates_by_pid(pid)
    response = get_details_by_pid(pid: pid)
    if response.success?
      #assumes there is one layer to these features at the moment
      return(JSON.parse(response.body).dig("features", 0, "geometry", "rings", 0, 0))
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  protected

  def parse_attributes_from_response(response)
    if response.success?
      #assumes there is one layer to these features at the moment
      return JSON.parse(response.body).dig("features", 0, "attributes")
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def parse_attributes_array_from_response(response)
    if response.success?
      #assumes there is one layer to these features at the moment
      return(JSON.parse(response.body).dig("features")&.map { |f| f["attributes"] } || [])
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end
end
