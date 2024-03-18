require "sidekiq-cron"

# in production mode we use redis-sentinel for HA Redis, locally / test just fallback to default (ENV['REDIS_URL'])
if Rails.env.production? && ENV["SKIP_DEPENDENCY_INITIALIZERS"].blank? # skip this during precompilation in the docker build stage
  redis_cfg = {
    name: ENV["REDIS_SENTINEL_MASTER_SET_NAME"],
    sentinels:
      Resolv
        .getaddresses(ENV["REDIS_SENTINEL_HEADLESS"])
        .map { |address| { host: address, port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379) } },
    db: ENV["SIDEKIQ_REDIS_DB"]&.to_i || 0,
    role: :master,
  }

  Sidekiq.configure_server do |config|
    config.redis = redis_cfg
    config.queues = %w[file_processing default]
    config.concurrency = ENV["SIDEKIQ_CONCURRENCY"].to_i
  end

  Sidekiq.configure_client { |config| config.redis = redis_cfg }

  # # Don't load crons in test and dev mode
  schedule_file = "config/sidekiq_cron_schedule.yml"
  Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file) if File.exist?(schedule_file)
end
