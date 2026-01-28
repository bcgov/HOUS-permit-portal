require "sidekiq-cron"
require "sidekiq-unique-jobs"

# in production mode we use redis-sentinel for HA Redis, locally / test just fallback to default (ENV['REDIS_URL'])
redis_config =
  if Rails.env.production? && ENV["IS_DOCKER_BUILD"].blank? # skip this during precompilation in the docker build stage
    {
      name: ENV["REDIS_SENTINEL_MASTER_SET_NAME"],
      driver: :ruby,
      sentinels:
        Resolv
          .getaddresses(ENV["REDIS_SENTINEL_HEADLESS"])
          .map do |address|
            {
              host: address,
              port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379)
            }
          end,
      db: ENV["SIDEKIQ_REDIS_DB"]&.to_i || 0,
      role: :master
    }
  else
    { url: ENV["SIDEKIQ_DEV_REDIS_URL"] }
  end

Sidekiq.configure_server do |config|
  config.redis = redis_config if redis_config
  config.queues = %w[file_processing webhooks websocket model_callbacks default]

  if ENV["SIDEKIQ_CONCURRENCY"].present?
    config.concurrency = ENV["SIDEKIQ_CONCURRENCY"].to_i
  end

  config.client_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Client
  end

  config.server_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Server
  end

  SidekiqUniqueJobs::Server.configure(config)
end

Sidekiq.configure_client do |config|
  config.redis = redis_config if redis_config

  config.client_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Client
  end
end

# # Don't load crons in test and dev mode
if Rails.env.production? && ENV["IS_DOCKER_BUILD"].blank?
  schedule_file = "config/sidekiq_cron_schedule.yml"
  if File.exist?(schedule_file)
    Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file)
  end
end
