class Integrations::LtsaParcelMapBc
  attr_accessor :client, :api_path
  def initialize
    parsed_url = URI.parse(ENV["GEO_LTSA_PARCELMAP_REST_URL"])
    @client = Faraday.new(ENV["GEO_LTSA_PARCELMAP_REST_URL"]) { |f| f.response :json, content_type: /\bjson$/ }
    @api_path = parsed_url.path
  end

  def get_details_by_pid(
    pid:,
    fields: "PID,PARCEL_STATUS,PARCEL_NAME,PARCEL_CLASS,OWNER_TYPE,MUNICIPALITY,REGIONAL_DISTRICT,WHEN_UPDATED,FEATURE_AREA_SQM"
  )
    @client.get(
      "query?f=json&returnIdsOnly=false&returnCountOnly=false&where=PID='#{pid}'&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=#{fields}",
    )
  end

  def get_feature_attributes_by_pid(
    pid:,
    fields: "PID,PARCEL_STATUS,PARCEL_NAME,PARCEL_CLASS,OWNER_TYPE,MUNICIPALITY,REGIONAL_DISTRICT,WHEN_UPDATED,FEATURE_AREA_SQM"
  )
    response = get_details_by_pid(pid: pid, fields: fields)
    if response.success?
      #assumes there is one layer to these features at the moment
      return response.body.dig("features", 0, "attributes")
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end
end
