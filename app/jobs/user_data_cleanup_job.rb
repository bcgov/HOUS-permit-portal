class UserDataCleanupJob
  include Sidekiq::Worker
  include EnvHelper

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
        PermitHubMailer.notify_user_archive_warning(
          user,
          warning_day
        ).deliver_later
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
        PermitHubMailer.notify_user_delete_warning(
          user,
          warning_day
        ).deliver_later
      end
    end
  end

  def delete_discarded_users(current_time, delete_after_days)
    cutoff_time = current_time - delete_after_days.days
    User
      .discarded
      .where(discarded_at: ..cutoff_time)
      .find_each do |user|
        handle_user_resources(user)
        user.destroy!
      rescue ActiveRecord::InvalidForeignKey,
             ActiveRecord::RecordNotDestroyed => e
        Rails.logger.error(
          "[UserDataCleanupJob] FAILED to delete user #{user.id}: #{e.message}"
        )
      rescue => e
        Rails.logger.error(
          "[UserDataCleanupJob] Unexpected error deleting user #{user.id}: #{e.message}"
        )
      end
  end

  def handle_user_resources(user)
    PublicRecordable.recordable_models.each do |model_class|
      # Skip if the model doesn't have a user association (shouldn't happen if using the concern correctly)
      association_name = model_class.public_recordable_user_association
      next unless association_name

      # Construct the foreign key from the association name
      foreign_key = "#{association_name}_id"

      # Find records belonging to this user
      # We need to use the association name to query, or manually construct the where clause
      # Since we don't know the inverse association name on User (e.g. created_step_codes vs step_codes),
      # we query the model directly.
      model_class
        .where(foreign_key => user.id)
        .find_each do |record|
          if record.public_record?
            record.take_user_snapshots!
            record.update_column(foreign_key, nil)
            # Reindex if the model is searchable to ensure consistency
            record.reindex if record.respond_to?(:search_data)
          end
        end
    end
  end

  def day_window_ending(current_time, target_days_ago)
    target_date = (current_time - target_days_ago.days).to_date
    start_time = target_date.beginning_of_day
    end_time = target_date.end_of_day
    [start_time, end_time]
  end
end
