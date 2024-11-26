class Wrappers::LtsaParcelMapBcGis < Wrappers::LtsaParcelMapBc
  class DoNotEncoder
    def self.encode(params)
      buffer = ""
      params.each { |key, value| buffer << "#{key}=#{value}&" }
      return buffer.chop
    end
  end

  def client
    @client ||=
      Faraday.new(url: base_url, headers: default_headers) do |faraday|
        faraday.options.params_encoder = DoNotEncoder
      end
  end

  def base_url
    ENV["GEO_LTSA_PARCELMAP_GIS_REST_URL"]
  end

  #Wrappers::LtsaParcelMapBcGis.new.search_pin_from_coordinates(coord_array: [-122.9889117,49.3114876])
  def search_pin_from_coordinates(coord_array: [], fields: "*")
    query_params = {
      f: "json",
      returnIdsOnly: false,
      returnCountOnly: false,
      where: "PIN+IS+NOT+NULL",
      geometry: coord_array.join(","),
      geometryType: "esriGeometryPoint",
      inSR: 4326,
      spatialRel: "esriSpatialRelIntersects",
      returnGeometry: true,
      outFields: fields
    }

    get("#{PARCEL_SERVICE}/query", query_params, true)
  end

  #Wrappers::LtsaParcelMapBcGis.new.search_pid_from_coordinates(coord_array: [-123.3709161,48.4177006])
  def search_pid_from_coordinates(coord_array: [], fields: "*")
    query_params = {
      f: "json",
      returnIdsOnly: false,
      returnCountOnly: false,
      where: "PID+IS+NOT+NULL",
      geometry: coord_array.join(","),
      geometryType: "esriGeometryPoint",
      inSR: 4326,
      spatialRel: "esriSpatialRelIntersects",
      returnGeometry: true,
      outFields: fields
    }

    get("#{PARCEL_SERVICE}/query", query_params, true)
  end
end
