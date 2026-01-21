module NotificationAggregators
  class PermitBlockReadySummary
    def self.call(
      permit_application_id:,
      collaboration_type:,
      user_id:,
      debounce_window_seconds:
    )
      permit_application = PermitApplication.find_by(id: permit_application_id)
      user = User.find_by(id: user_id)

      return if permit_application.blank? || user.blank?
      return unless user.preference&.enable_email_collaboration_notification

      # Look back 3x the window to catch "bursts" where the timer kept resetting,
      # plus 1 minute for Sidekiq latency safety.
      lookback_duration = (debounce_window_seconds.to_i * 3) + 1.minute
      window_start = Time.current - lookback_duration
      statuses =
        PermitBlockStatus
          .where(
            permit_application_id: permit_application_id,
            collaboration_type: collaboration_type,
            status: :ready
          )
          .where("updated_at >= ?", window_start)
          .select(&:block_exists?)

      Rails.logger.info(
        "[PermitBlockReadySummary] Found #{statuses.count} status(es) in debounce window"
      )
      return if statuses.empty?

      requirement_block_names =
        statuses.map(&:requirement_block_name).compact.uniq

      {
        permit_application: permit_application,
        user: user,
        collaboration_type: collaboration_type,
        requirement_block_names: requirement_block_names
      }
    end
  end
end
