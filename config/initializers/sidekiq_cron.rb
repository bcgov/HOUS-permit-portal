if !Rails.env.test? && ENV["DOCKER_BUILDING"].blank?
  require "sidekiq-cron"

  schedule_file = "config/sidekiq_cron_schedule.yml"
  Sidekiq::Cron::Job.load_from_hash YAML.load_file(schedule_file) if File.exist?(schedule_file)
end
