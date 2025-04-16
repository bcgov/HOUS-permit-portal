class CheckExpiringApiKeysJob
  include Sidekiq::Worker

  # Intervals in days before expiration to send notifications
  NOTIFICATION_INTERVALS = [30, 14, 5, 2, 1].freeze

  def perform
    now = Time.current

    NOTIFICATION_INTERVALS.each do |interval_days|
      process_interval(interval_days, now)
    end
  end

  private

  def process_interval(interval_days, current_time)
    # Calculate the target expiration window for this interval
    # We look for keys expiring *exactly* between (interval_days - 1) and interval_days from now.
    # Example: For 30 days, look for keys expiring between 29 and 30 days from now.
    start_time = current_time + (interval_days - 1).days
    end_time = current_time + interval_days.days

    Rails.logger.debug "Checking for keys expiring between #{start_time} and #{end_time} for #{interval_days}-day notification."

    expiring_keys =
      ExternalApiKey
        .where(revoked_at: nil)
        .where(expired_at: start_time..end_time)
        .where.not(notification_email: [nil, ""])
        .includes(:jurisdiction, :api_key_expiration_notifications)

    keys_to_notify =
      expiring_keys.reject do |key|
        key.api_key_expiration_notifications.any? do |n|
          n.notification_interval_days == interval_days
        end
      end

    keys_to_notify.each do |key|
      send_notification(key, interval_days, current_time)
    end
  end

  def send_notification(key, interval_days, sent_at_time)
    # Pass interval_days to the mailer
    PermitHubMailer.notify_api_key_status_change(
      key,
      :expiring,
      interval_days
    ).deliver

    # Record that the notification was sent
    key.api_key_expiration_notifications.create!(
      notification_interval_days: interval_days,
      sent_at: sent_at_time
    )
  rescue => e
    Rails.logger.error "Failed to send or record #{interval_days}-day expiration notification for API Key ID: #{key.id}. Error: #{e.message}"
    # Decide if you want to retry or just log the error.
    # Depending on the error, the create! might have failed after the email was sent.
  end
end
