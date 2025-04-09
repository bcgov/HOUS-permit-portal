class CheckExpiringApiKeysJob
  include Sidekiq::Worker

  # Find ExternalApiKeys expiring within the next 24 hours (default)
  # and send a notification email to the configured notification_email address.
  def perform(time_frame_hours = 24)
    time_frame = time_frame_hours.hours
    expiring_keys =
      ExternalApiKey.expiring_soon(time_frame).includes(:jurisdiction)

    expiring_keys.each do |key|
      # Check again if notification_email is present before enqueuing
      if key.notification_email.present?
        Rails.logger.info "Queueing expiration notification for API Key ID: #{key.id}, Name: #{key.name}"
        PermitHubMailer.notify_api_key_status_change(key, :expiring).deliver
      else
        Rails.logger.warn "Skipping expiration notification for API Key ID: #{key.id}, Name: #{key.name} due to missing notification_email"
      end
    end

    Rails.logger.info "CheckExpiringApiKeysJob finished. Found #{expiring_keys.count} keys expiring within #{time_frame_hours} hours."
  end
end
