# app/jobs/resource_reminder_job.rb
class ResourceReminderJob
  include Sidekiq::Worker
  sidekiq_options queue: :default

  def perform
    reminder_days = ENV.fetch("RESOURCE_REMINDER_DAYS", 180).to_i
    cutoff_date = reminder_days.days.ago

    Jurisdiction.all.find_each do |jurisdiction|
      # Find resources that need reminder:
      # - Updated more than X days ago
      # - AND either never had a reminder OR last reminder was more than X days ago
      stale_resources =
        jurisdiction.resources.where(
          "updated_at < ? AND (last_reminder_sent_at IS NULL OR last_reminder_sent_at < ?)",
          cutoff_date,
          cutoff_date
        )

      next unless stale_resources.any?

      # Send notifications to jurisdiction managers
      NotificationService.publish_resource_reminder_event(
        jurisdiction,
        stale_resources.pluck(:id)
      )

      # Mark resources as reminded
      stale_resources.update_all(last_reminder_sent_at: Time.current)
    end
  end
end
