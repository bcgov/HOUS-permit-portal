class Integrations::LtsaParcelMapBc
  attr_accessor :client, :api_path

  PARCEL_SERVICE = "/whse/bcgw_pub_whse_cadastre/MapServer/0"
  HISTORIC_SERVICE = "/whse/bcgw_pub_whse_human_cultural_economic/MapServer/1"
  IMAP_SERVICE = "/mpcm/bcgw/MapServer/dynamicLayer"

  def initialize
    parsed_url = URI.parse(ENV["GEO_LTSA_PARCELMAP_REST_URL"])
    @client = Faraday.new(ENV["GEO_LTSA_PARCELMAP_REST_URL"]) { |f| f.response :json, content_type: /\bjson$/ }
    @api_path = parsed_url.path
  end

  def get_details_by_pid(
    pid:,
    fields: "PID,PARCEL_STATUS,PARCEL_NAME,PARCEL_CLASS,OWNER_TYPE,MUNICIPALITY,REGIONAL_DISTRICT,WHEN_UPDATED,FEATURE_AREA_SQM"
  )
    query = "returnIdsOnly=false&returnCountOnly=false"
    query += "&where=PID='#{pid}'"
    query += "&returnGeometry=true&spatialRel=esriSpatialRelIntersects"
    query += "&outFields=#{fields}"
    @client.get("#{ENV["GEO_LTSA_PARCELMAP_REST_URL"]}#{PARCEL_SERVICE}/query?f=json&#{query}")
  end

  def historic_site_by_pid(pid:)
    query = "where=HISTORIC_SITE_IND='Y' AND PARCEL_DESCRIPTION='#{pid}'&returnGeometry=true&outFields=*"
    response = @client.get("#{ENV["GEO_LTSA_PARCELMAP_REST_URL"]}#{HISTORIC_SERVICE}/query?f=json&#{query}")
    #assuem if there is a parcel description match not to use ltsa geometry matching
    return response if response.success? && response.body.dig("features").length > 0

    #get geometry from pid
    response_for_geometry = get_details_by_pid(pid: pid, fields: "PID")
    if response_for_geometry.success? && response_for_geometry.body.dig("features", 0, "geometry")
      #interesect the geometry from the city over
      pid_geo = response_for_geometry.body.dig("features", 0, "geometry")
      query =
        "where=HISTORIC_SITE_IND='Y'&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=#{CGI.escape(pid_geo.to_json)}&geometryType=esriGeometryPolygon&outFields=*"
      @client.get("#{ENV["GEO_LTSA_PARCELMAP_REST_URL"]}#{HISTORIC_SERVICE}/query?f=json&#{query}")
    else
      raise ArgumentError.new("invalid geometry returned")
    end
  end

  def get_dynamic_features_by_pid(pid:)
    #call the get_details_by_pid to get the active polygon for the parcel
    query = "returnIdsOnly=false&returnCountOnly=false"

    @client.get("#{ENV["GEO_LTSA_PARCELMAP_REST_URL"]}#{PARCEL_SERVICE}/query?f=json&#{query}")
    # https://maps.gov.bc.ca/arcserver/rest/services/mpcm/bcgw/MapServer/dynamicLayer/query?layer=Your_Layer_Definition&f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry={"rings":[[[x1, y1], [x2, y2], [x3, y3], ..., [x1, y1]]],"spatialReference":{"wkid":Spatial_Reference_ID}}&geometryType=esriGeometryPolygon&inSR=Spatial_Reference_ID&outSR=Spatial_Reference_ID
  end
end
