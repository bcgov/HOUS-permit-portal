class Rack::Attack
  # cache.store = ActiveSupport::Cache::RedisStore.new # Configure cache store (replace if necessary)

  redis_options =
    if Rails.env.production? && ENV["IS_DOCKER_BUILD"].blank? # skip this during precompilation in the docker build stage
      {
        url:
          "redis://#{ENV["REDIS_SENTINEL_MASTER_SET_NAME"]}/#{ENV["RATE_LIMIT_REDIS_DB"]&.to_i || 2}",
        sentinels:
          Resolv
            .getaddresses(ENV["REDIS_SENTINEL_HEADLESS"])
            .map do |address|
              {
                host: address,
                port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379)
              }
            end
      }
    else
      { url: ENV["RATE_LIMIT_DEV_REDIS_URL"] }
    end

  self.cache.store = ActiveSupport::Cache::RedisCacheStore.new(**redis_options)

  # Define a Rack-Attack throttle for IP address
  throttle("external_api/ip", limit: 300, period: 5.minutes) do |req|
    # Limit applies if route starts with "/external_api"
    req.ip if req.path.start_with?("/external_api")
  end

  # Define a Rack-Attack throttle for API token
  throttle("external_api/token", limit: 100, period: 1.minutes) do |req|
    # Extract bearer token from authorization header
    if req.path.start_with?("/external_api")
      token = req.env["HTTP_AUTHORIZATION"]&.split(" ")&.try(:[], 1)
      # Apply throttle only if token is present
      token.present? ? token : nil
    end
  end

  self.throttled_responder =
    lambda do |_request|
      [
        429,
        { "Content-Type" => "application/json" },
        [
          {
            data: {
            },
            meta: {
              message: "Rate limit exceeded. Try again later.",
              title: "Rate limit exceeded",
              type: "error"
            }
          }.to_json
        ]
      ]
    end
end
