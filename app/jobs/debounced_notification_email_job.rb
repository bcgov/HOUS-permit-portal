# Debounces notification emails by using sidekiq-unique-jobs to ensure only one
# job per unique lock_key is scheduled at a time.
#
# How it works:
# 1. First event schedules a job with perform_in(debounce_window)
# 2. Subsequent events with the same lock_key are rejected (logged) while the first job is pending
# 3. When the job executes, the aggregator queries for all events within the debounce window
# 4. A single summary email is sent covering all events
#
# The lock is held from when the job is scheduled until just before perform() runs.
# This prevents duplicate jobs from being scheduled during the debounce window.
class DebouncedNotificationEmailJob
  include Sidekiq::Worker

  sidekiq_options lock: :until_executing,
                  lock_args_method: :lock_args,
                  queue: :default,
                  on_conflict: {
                    client: :replace,
                    server: :reject
                  }

  # Use only the lock_key (first argument) for uniqueness.
  # This ensures jobs with the same lock_key are deduplicated regardless of other params.
  def self.lock_args(args)
    [args[0]]
  end

  def perform(
    _lock_key,
    debounce_window_seconds,
    aggregator_class_name,
    aggregator_args,
    mailer_class_name,
    mailer_method
  )
    Rails.logger.info(
      "[DebouncedNotificationEmailJob] Executing job with lock_key: #{_lock_key}"
    )

    aggregator_class = aggregator_class_name.constantize
    payload =
      aggregator_class.call(
        **aggregator_args.to_h.symbolize_keys.merge(
          debounce_window_seconds: debounce_window_seconds.to_i
        )
      )

    if payload.blank?
      Rails.logger.info(
        "[DebouncedNotificationEmailJob] No payload from aggregator, skipping email"
      )
      return
    end

    Rails.logger.info(
      "[DebouncedNotificationEmailJob] Sending #{mailer_class_name}##{mailer_method}"
    )
    mailer_class = mailer_class_name.constantize
    mailer_class.public_send(mailer_method, **payload).deliver_later
  end
end
