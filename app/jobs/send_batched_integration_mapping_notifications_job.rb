# app/jobs/send_batched_integration_mapping_notifications_job.rb
class SendBatchedIntegrationMappingNotificationsJob
  include Sidekiq::Worker
  sidekiq_options queue: :default

  def perform()
    # Process notifications for both ExternalApiKey and User
    process_unprocessed_notifications(ExternalApiKey)
    process_unprocessed_notifications(User)
  end

  private

  def process_unprocessed_notifications(notifiable_klass)
    notifiable_klass
      .joins(:integration_mapping_notifications)
      .where(integration_mapping_notifications: { processed_at: nil })
      .distinct
      .find_each do |notifiable|
        # Get all unprocessed notifications for the notifiable (either User or ExternalApiKey)
        notifications =
          notifiable.integration_mapping_notifications.where(processed_at: nil)

        notification_ids = notifications.pluck(:id)

        # Bundle notifications into an email
        if notifications.any?
          PermitHubMailer.send_batched_integration_mapping_notifications(
            notifiable,
            notification_ids
          )&.deliver_later

          # Mark notifications as processed
          notifications.update_all(processed_at: Time.current)
        end
      end
  end
end
