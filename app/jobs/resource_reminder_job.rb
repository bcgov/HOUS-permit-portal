# app/jobs/resource_reminder_job.rb
class ResourceReminderJob
  include Sidekiq::Worker
  sidekiq_options queue: :default

  REMINDER_THRESHOLD_MONTHS = 6

  def perform
    cutoff_date = REMINDER_THRESHOLD_MONTHS.months.ago

    Jurisdiction.all.find_each do |jurisdiction|
      # Find resources that need reminder:
      # - Updated more than 6 months ago
      # - AND either never had a reminder OR last reminder was more than 6 months ago
      stale_resources =
        jurisdiction.resources.where(
          "updated_at < ? AND (last_reminder_sent_at IS NULL OR last_reminder_sent_at < ?)",
          cutoff_date,
          cutoff_date
        )

      next unless stale_resources.any?

      # Get all review managers for this jurisdiction (includes regional review managers)
      review_managers = jurisdiction.review_managers.to_a
      regional_review_managers = jurisdiction.regional_review_managers.to_a
      all_managers = (review_managers + regional_review_managers).uniq

      next unless all_managers.any?

      # Send email to each review manager
      # Pass resource IDs instead of relation (ActiveJob can't serialize relations)
      resource_ids = stale_resources.pluck(:id)
      all_managers.each do |manager|
        PermitHubMailer.remind_resource_update(
          manager,
          jurisdiction,
          resource_ids
        ).deliver_later
      end

      # Mark resources as reminded
      stale_resources.update_all(last_reminder_sent_at: Time.current)
    end
  end
end
