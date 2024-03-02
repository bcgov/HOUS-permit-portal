require "sidekiq-cron"

if ENV["SKIP_DEPENDENCY_INITIALIZERS"].blank? # skip this during precompilation in the docker build stage
  if Rails.env.production?
    # in production mode we use redis-sentinel for HA Redis, locally / test just fallback to default
    redis_cfg = {
      url: ENV["REDIS_SENTINEL_MASTER_SET_URL"],
      sentinels: [{ host: ENV["REDIS_SENTINEL_HOST"], port: (ENV["REDIS_SENTINEL_PORT"]&.to_i || 26_379) }],
      role: :master,
    }

    Sidekiq.configure_server do |config|
      config.redis = redis_cfg
      config.options[:queues] = %w[promote_asset_and_make_derivatives default]
      config.options[:concurrency] = ENV["SIDEKIQ_CONCURRENCY"].to_i
    end
    Sidekiq.configure_client { |config| config.redis = redis_cfg }

    # # Don't load crons in test and dev mode
    schedule_file = "config/sidekiq_cron_schedule.yml"
    Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file) if File.exist?(schedule_file)
  end
end
