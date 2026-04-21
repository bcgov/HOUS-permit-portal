require "vcr"

VCR.configure do |config|
  config.cassette_library_dir = "spec/vcr_cassettes"
  config.hook_into :faraday
  config.configure_rspec_metadata!
  config.ignore_request do |request|
    request.uri.starts_with?(
      ENV["ELASTICSEARCH_URL"] || "http://localhost:9200"
    )
  end
  config.filter_sensitive_data("<ENV_CONSIGNO_URL>") { ENV["CONSIGNO_URL"] }
  config.filter_sensitive_data("<GEO_LTSA_PARCELMAP_REST_URL>") do
    ENV["GEO_LTSA_PARCELMAP_REST_URL"]
  end
  config.filter_sensitive_data("<GEO_LTSA_PARCELMAP_GIS_REST_URL>") do
    ENV["GEO_LTSA_PARCELMAP_GIS_REST_URL"]
  end
  config.filter_sensitive_data("<ARCHISTAR_API_ENDPOINT>") do
    ENV["ARCHISTAR_API_ENDPOINT"]
  end
  config.filter_sensitive_data("<ARCHISTAR_API_KEY>") do
    ENV["ARCHISTAR_API_KEY"]
  end
  config.filter_sensitive_data("<BCGOV_ADDRESS_GEOCODER_URL>") do
    ENV["BCGOV_ADDRESS_GEOCODER_URL"]
  end
  config.filter_sensitive_data("<BCGOV_ADDRESS_GEOCODER_API_KEY>") do
    ENV["BCGOV_ADDRESS_GEOCODER_API_KEY"]
  end
  config.filter_sensitive_data("<GEO_ALR_REST_URL>") { ENV["GEO_ALR_REST_URL"] }
end
