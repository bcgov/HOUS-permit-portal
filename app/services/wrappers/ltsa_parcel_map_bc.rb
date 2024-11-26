class Wrappers::LtsaParcelMapBc < Wrappers::Base
  PARCEL_SERVICE = "whse/bcgw_pub_whse_cadastre/MapServer/0"
  HISTORIC_SERVICE = "whse/bcgw_pub_whse_human_cultural_economic/MapServer/1"
  IMAP_SERVICE = "mpcm/bcgw/MapServer/dynamicLayer"

  # Define the acceptable WKID range based on EPSG registry
  MIN_WKID = 1000.freeze
  MAX_WKID = 999_999.freeze
  KNOWN_WKIDS = [102_190, 3005, 4326].freeze

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
      outFields: fields
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
      outFields: fields
    }

    get("#{PARCEL_SERVICE}/query", query_params, true)
  end

  def historic_site_by_pid(pid:)
    query_params = {
      f: "json",
      where: "HISTORIC_SITE_IND='Y' AND PARCEL_DESCRIPTION='#{pid}'",
      returnGeometry: true,
      outFields: "*"
    }
    response = get("#{HISTORIC_SERVICE}/query", query_params, true)

    # Assume if there is a parcel description match not to use LTSA geometry matching
    if response.success? && JSON.parse(response.body).dig("features").length > 0
      return parse_attributes_from_response(response)
    end

    # Get geometry from PID
    response_for_geometry = get_details_by_pid(pid: pid, fields: "PID")
    if response_for_geometry.success? &&
         JSON.parse(response_for_geometry.body).dig("features", 0, "geometry")
      # Intersect the geometry from the city over
      pid_geo =
        JSON.parse(response_for_geometry.body).dig("features", 0, "geometry")
      pid_geo_query_params = {
        f: "json",
        where: "HISTORIC_SITE_IND='Y'",
        returnGeometry: true,
        spatialRel: "esriSpatialRelIntersects",
        geometry: pid_geo.to_json,
        geometryType: "esriGeometryPolygon",
        outFields: "*"
      }

      pid_geo_response =
        get("#{HISTORIC_SERVICE}/query", pid_geo_query_params, true)
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
      attributes = parse_attributes_from_response(response)
      raise Errors::FeatureAttributesRetrievalError unless attributes.present?
      return attributes
    else
      raise Errors::LtsaUnavailableError
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
      attributes = parse_attributes_from_response(response)
      raise Errors::FeatureAttributesRetrievalError unless attributes.present?
      return attributes
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def get_coordinates_by_pid(pid)
    return nil if pid.blank?
    begin
      response = get_details_by_pid(pid: pid)
      get_coordinates_from_ltsa_response(response)
    rescue Errors::FeatureAttributesRetrievalError => e
      nil
    end
  end

  def get_coordinates_by_pin(pin)
    return nil if pin.blank?
    begin
      response = get_details_by_pin(pin: pin)
      get_coordinates_from_ltsa_response(response)
    rescue Errors::FeatureAttributesRetrievalError => e
      nil
    end
  end

  def get_coordinates_from_ltsa_response(response)
    if response.success?
      #assumes there is one layer to these features at the moment
      # return(JSON.parse(response.body).dig("features", 0, "geometry", "rings", 0, 0))

      parsed_response = JSON.parse(response.body)

      wkid = parsed_response.dig("spatialReference", "wkid")

      raise Errors::FeatureAttributesRetrievalError if !known_wkid?(wkid)

      geometry_coords =
        parsed_response.dig("features", 0, "geometry", "rings", 0)

      if (geometry_coords)
        #cartesians system for 102190 OR 3005 #{"wkid"=>, "latestWkid"=>3005}
        #https://epsg.io/102190.proj4
        factory = wkid_factory_lookup(wkid || 102_190)

        # Create an array of RGeo points
        points = geometry_coords.map { |xy| factory.point(xy[0], xy[1]) }

        # Create a polygon from the points
        polygon = factory.polygon(factory.linear_ring(points))

        # Calculate the centroid
        centroid = polygon.centroid

        target_factory = wkid_factory_lookup(4326) #default bc geo utilizes 4326

        transformed_centroid =
          RGeo::Feature.cast(centroid, factory: target_factory, project: true)

        [transformed_centroid.x, transformed_centroid.y]
      else
        raise Errors::FeatureAttributesRetrievalError
      end
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def wkid_factory_lookup(wkid)
    # Validate that wkid is an integer
    raise ArgumentError, "WKID must be an integer" unless wkid.is_a?(Integer)

    # Validate that wkid is within the acceptable range
    unless wkid.between?(MIN_WKID, MAX_WKID)
      raise ArgumentError,
            "WKID #{wkid} is out of the valid range (#{MIN_WKID}-#{MAX_WKID})"
    end

    case (wkid)
    when 102_190
      RGeo::Cartesian.factory(
        srid: 102_190,
        proj4:
          "+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +datum=NAD83 +units=m +no_defs +type=crs",
        coord_sys:
          'PROJCS["NAD_1983_BC_Environment_Albers (deprecated)",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],PROJECTION["Albers_Conic_Equal_Area"],PARAMETER["latitude_of_center",45],PARAMETER["longitude_of_center",-126],PARAMETER["standard_parallel_1",50],PARAMETER["standard_parallel_2",58.5],PARAMETER["false_easting",1000000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["ESRI","102190"]]'
      )
    when 3005
      RGeo::Cartesian.factory(
        srid: 3005,
        proj4:
          "+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
        coord_sys:
          'PROJCS["NAD83 / BC Albers",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101],TOWGS84[0,0,0,0,0,0,0]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],PROJECTION["Albers_Conic_Equal_Area"],PARAMETER["latitude_of_center",45],PARAMETER["longitude_of_center",-126],PARAMETER["standard_parallel_1",50],PARAMETER["standard_parallel_2",58.5],PARAMETER["false_easting",1000000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","3005"]]'
      )
    when 4326
      RGeo::Geographic.spherical_factory(
        srid: 4326,
        proj4: "+proj=longlat +datum=WGS84 +no_defs +type=crs",
        coord_sys:
          'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]'
      )
    else
      #fetch the proj4 string from website
      espg = Faraday.new("https://epsg.io")
      response_proj4 = espg.get("#{wkid}.proj4")
      response_wkt = espg.get("#{wkid}.wkt")
      RGeo::Cartesian.factory(
        srid: wkid,
        proj4: response_proj4.body,
        coord_sys: response_wkt.body
      )
      #this will raise an error if it fails
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
      return(
        JSON
          .parse(response.body)
          .dig("features")
          &.map { |f| f["attributes"] } || []
      )
    else
      raise Errors::FeatureAttributesRetrievalError
    end
  end

  def known_wkid?(wkid)
    KNOWN_WKIDS.include?(wkid.to_i)
  end
end
