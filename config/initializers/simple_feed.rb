require "simplefeed"

# Define a method to build Redis configuration for Sentinel
def redis_sentinel_config
  {
    url:
      "redis://#{ENV["REDIS_SENTINEL_MASTER_SET_NAME"]}/#{ENV["SIMPLE_FEED_REDIS_DB"]&.to_i || 3}",
    driver: :ruby,
    sentinels:
      Resolv
        .getaddresses(ENV["REDIS_SENTINEL_HEADLESS"])
        .map do |address|
          { host: address, port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379) }
        end,
    role: :master
  }
end

# Configure SimpleFeed
SimpleFeed.define(:user_feed) do |f|
  if Rails.env.production? && ENV["IS_DOCKER_BUILD"].blank?
    f.provider =
      SimpleFeed.provider(
        :redis,
        redis: -> { Redis.new(redis_sentinel_config) },
        pool_size: ENV["SIMPLE_FEED_POOL_SIZE"]&.to_i || 20
      )
  else
    # Fallback to default Redis configuration for non-production environments
    f.provider =
      SimpleFeed.provider(
        :redis,
        redis: -> do
          Redis.new(
            url:
              ENV.fetch(
                "SIMPLE_FEED_DEV_REDIS_URL",
                "redis://localhost:6379/3"
              ),
            driver: :ruby
          )
        end,
        pool_size: 10
      )
  end

  f.per_page = (ENV["NOTIFICATION_FEED_PER_PAGE"] || 5).to_i
  f.batch_size = (ENV["NOTIFICATION_FEED_PER_PAGE"] || 5).to_i * 3
  f.max_size = 100
end
