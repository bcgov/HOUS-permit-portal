module Reports
  class Range
    PRESETS = {
      "3_months" => 3.months,
      "6_months" => 6.months,
      "12_months" => 12.months,
      "all_time" => nil
    }.freeze
    DEFAULT = "12_months"

    attr_reader :preset, :start_date, :end_date

    def self.parse(preset)
      key = PRESETS.key?(preset.to_s) ? preset.to_s : DEFAULT
      new(key)
    end

    def initialize(preset)
      @preset = preset
      @end_date = Time.current.end_of_day
      duration = PRESETS.fetch(preset)
      @start_date = duration ? duration.ago.beginning_of_day : nil
    end

    def all_time?
      start_date.nil?
    end

    def time_range
      all_time? ? (..end_date) : (start_date..end_date)
    end

    def apply(scope, column)
      if all_time?
        scope.where("#{column} <= ?", end_date)
      else
        scope.where(column => start_date..end_date)
      end
    end

    def to_h
      {
        preset: preset,
        start_date: start_date&.iso8601,
        end_date: end_date.iso8601
      }
    end

    def label
      I18n.t("reports.ranges.#{preset}")
    end

    def slug
      preset
    end

    def previous
      return nil if all_time?

      duration = PRESETS.fetch(preset)
      self
        .class
        .new(preset)
        .tap do |prev|
          prev.instance_variable_set(:@end_date, start_date - 1.second)
          prev.instance_variable_set(:@start_date, (start_date - duration))
        end
    end

    def previous_quarter
      return nil if all_time?

      self
        .class
        .new(preset)
        .tap do |prev|
          prev.instance_variable_set(:@end_date, 3.months.ago.end_of_day)
          prev.instance_variable_set(
            :@start_date,
            6.months.ago.beginning_of_day
          )
        end
    end
  end
end
