# frozen_string_literal: true

# Add Warden middleware to AnyCable stack to allow accessing
# Devise current user via `env["warden"].user`.
#
# See https://docs.anycable.io/ruby/authentication
AnyCable::Rails::Rack.middleware.use Warden::Manager do |config|
  Devise.warden_config = config
end

# In Openshift, we use HA-Redis with Sentinels, configuration is slightly different
if Rails.env.production? && ENV["IS_DOCKER_BUILD"].blank?
  AnyCable.configure do |config|
    config.redis_url =
      "redis://#{ENV["REDIS_SENTINEL_MASTER_SET_NAME"]}/#{ENV["ANYCABLE_REDIS_DB"]&.to_i || 1}"
    config.redis_sentinels =
      Resolv
        .getaddresses(ENV["REDIS_SENTINEL_HEADLESS"])
        .map do |address|
          { host: address, port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379) }
        end
    # If needed, custom connection code here to explicitly set the role or other specific settings
  end
end
