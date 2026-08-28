module Reports
  class EnablementHistory
    def initialize(events, now: Time.current)
      @events =
        Array(events).sort_by { |event| [event.occurred_at, event.created_at] }
      @now = now
    end

    def first_enabled_at
      @events.find(&:enabled?)&.occurred_at
    end

    def currently_enabled?
      @events.last&.enabled? || false
    end

    def last_changed_at
      @events.last&.occurred_at
    end

    def churned?
      first_enabled_at.present? && !currently_enabled?
    end

    def never_enabled?
      first_enabled_at.nil?
    end

    def approximate?
      @events.any? { |event| event.seeded? || event.inferred? }
    end

    def cumulative_days
      (enabled_seconds_between(Time.zone.at(0), @now) / 1.day).round
    end

    def enabled_seconds_between(window_start, window_end)
      return 0.0 if window_end <= window_start

      total = 0.0
      open_start = nil
      @events.each do |event|
        at = event.occurred_at
        if event.enabled?
          next if at >= window_end

          open_start ||= [at, window_start].max
        elsif open_start
          close_at = [at, window_end].min
          total += close_at - open_start if close_at > open_start
          open_start = nil
          break if at >= window_end
        end
      end
      total += window_end - open_start if open_start && open_start < window_end
      [total, 0].max
    end

    def days_to_first_submission(submitted_at)
      return nil if submitted_at.blank? || first_enabled_at.blank?

      seconds = enabled_seconds_between(first_enabled_at, submitted_at)
      (seconds / 1.day).round
    end
  end
end
