require "rgeo"
require "rgeo/proj4"

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
      # assumes there is one layer to these features at the moment
      return response.body.dig("features", 0, "attributes")
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def get_coordinates_by_pid(pid)
    response = get_details_by_pid(pid: pid)
    if response.success?
      # assumes there is one layer to these features at the moment
      geometry = response.body.dig("features", 0, "geometry")
      factory =
        RGeo::Cartesian.factory(
          srid: response.body.dig("spatialReference", "latestWkid"), # 3005
        )
      outer_ring = factory.linear_ring(geometry["rings"][0].map { |coords| factory.point(*coords) })
      # Create the polygon
      rgeo_polygon = factory.polygon(outer_ring)

      # Calculate the centroid
      centroid = rgeo_polygon.centroid

      source_projection = RGeo::CoordSys::Proj4.create("EPSG:3005")

      # source_projection = RGeo::CoordSys::Proj4.create('+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')

      target_projection = RGeo::CoordSys::Proj4.create("EPSG:3857")

      # geography = RGeo::Geos.factory(coord_sys: "EPSG:3005", srid: 3005)
      target_factory = RGeo::Geos.factory(coord_sys: "EPSG:3857", srid: 3857)

      geo_point = RGeo::Feature.cast(centroid, project: true, factory: target_factory)

      binding.pry

      geo_point

      # r =
      #   RGeo::CoordSys::Proj4.transform_coords(
      #     source_projection,
      #     target_projection,
      #     centroid.x,
      #     centroid.y,
      #     nil
      #   )

      # return r.map { |latlng| (latlng / 100_000).round(7) }
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end
end
