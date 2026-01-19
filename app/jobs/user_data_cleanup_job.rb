class UserDataCleanupJob
  include Sidekiq::Worker

  DEFAULT_ARCHIVE_AFTER_DAYS = 1095
  DEFAULT_DELETE_AFTER_DAYS = 1460
  DEFAULT_WARNING_DAYS = [30, 7].freeze

  def perform
    now = Time.current
    archive_after_days =
      integer_env("USER_ARCHIVE_AFTER_DAYS", DEFAULT_ARCHIVE_AFTER_DAYS)
    delete_after_days =
      integer_env("USER_DELETE_AFTER_DAYS", DEFAULT_DELETE_AFTER_DAYS)
    archive_warning_days =
      integer_list_env("USER_ARCHIVE_WARNING_DAYS", DEFAULT_WARNING_DAYS)
    delete_warning_days =
      integer_list_env("USER_DELETE_WARNING_DAYS", DEFAULT_WARNING_DAYS)

    send_archive_warnings(now, archive_after_days, archive_warning_days)
    archive_inactive_users(now, archive_after_days)
    send_delete_warnings(now, delete_after_days, delete_warning_days)
    delete_discarded_users(now, delete_after_days)
  end

  private

  def send_archive_warnings(current_time, archive_after_days, warning_days)
    warning_days.each do |warning_day|
      target_days_ago = archive_after_days - warning_day
      next if target_days_ago <= 0

      start_time, end_time = day_window_ending(current_time, target_days_ago)
      users = User.kept.last_sign_in_between(start_time, end_time)

      users.find_each do |user|
        PermitHubMailer.notify_user_archive_warning(user, warning_day).deliver
      end
    end
  end

  def archive_inactive_users(current_time, archive_after_days)
    cutoff_time = current_time - archive_after_days.days
    User.kept.inactive_since(cutoff_time).find_each(&:discard)
  end

  def send_delete_warnings(current_time, delete_after_days, warning_days)
    warning_days.each do |warning_day|
      target_days_ago = delete_after_days - warning_day
      next if target_days_ago <= 0

      start_time, end_time = day_window_ending(current_time, target_days_ago)
      users = User.discarded_between(start_time, end_time)

      users.find_each do |user|
        PermitHubMailer.notify_user_delete_warning(user, warning_day).deliver
      end
    end
  end

  def delete_discarded_users(current_time, delete_after_days)
    cutoff_time = current_time - delete_after_days.days
    User.discarded.where(discarded_at: ..cutoff_time).find_each(&:destroy!)
  end

  def day_window_ending(current_time, target_days_ago)
    start_time = current_time - target_days_ago.days
    end_time = current_time - (target_days_ago - 1).days
    [start_time, end_time]
  end

  def integer_env(name, default_value)
    Integer(ENV.fetch(name, default_value), 10)
  rescue ArgumentError, TypeError
    default_value
  end

  def integer_list_env(name, default_value)
    raw_value = ENV[name]
    return default_value if raw_value.blank?

    parsed =
      raw_value
        .split(",")
        .map do |item|
          begin
            Integer(item.strip, 10)
          rescue StandardError
            nil
          end
        end
        .compact
        .uniq

    parsed.any? ? parsed : default_value
  end
end
