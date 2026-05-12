# frozen_string_literal: true

class CleanupMappingSidekiqQueue < ActiveRecord::Migration[7.2]
  LEGACY_JOB_CLASS = "SendBatchedIntegrationMappingNotificationsJob"
  LEGACY_CRON_JOB_NAME = "send_batched_integration_mapping_notifications"

  def up
    require "sidekiq-cron"
    require "sidekiq/api"

    Sidekiq::Cron::Job.find(LEGACY_CRON_JOB_NAME)&.destroy

    [
      Sidekiq::Queue.new("default"),
      Sidekiq::RetrySet.new,
      Sidekiq::ScheduledSet.new,
      Sidekiq::DeadSet.new
    ].each { |job_set| delete_legacy_jobs(job_set) }
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def delete_legacy_jobs(job_set)
    job_set.each { |job| job.delete if legacy_job?(job) }
  end

  def legacy_job?(job)
    item = job.item
    first_arg = item["args"]&.first

    job.klass == LEGACY_JOB_CLASS || item["class"] == LEGACY_JOB_CLASS ||
      item["wrapped"] == LEGACY_JOB_CLASS || first_arg == LEGACY_JOB_CLASS ||
      (first_arg.is_a?(Hash) && first_arg["job_class"] == LEGACY_JOB_CLASS)
  end
end
