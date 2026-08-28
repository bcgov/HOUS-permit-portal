require "csv"

module Reports
  class Base
    SMALL_N = 10
    GROWTH_MIN_BASE = 10

    FIRST_SUBMITTED_AT_SQL = <<~SQL.squish
      (SELECT MIN(submission_versions.created_at)
       FROM submission_versions
       WHERE submission_versions.permit_application_id = permit_applications.id)
    SQL

    attr_reader :range

    def self.key
      name.demodulize.underscore
    end

    def self.title
      I18n.t("reports.#{key}.title")
    end

    def self.description
      I18n.t("reports.#{key}.description")
    end

    def initialize(range:)
      @range = range
    end

    def call
      {
        key: self.class.key,
        title: self.class.title,
        description: self.class.description,
        range: range.to_h,
        computed_at: Time.current.iso8601,
        headline_figures: headline_figures,
        charts: charts,
        tables: tables,
        notes: notes,
        empty: empty?
      }
    end

    def export_csv
      CSV.generate do |csv|
        tables.each_with_index do |tbl, index|
          csv << [tbl[:key]] if tables.length > 1
          csv << tbl[:columns].map { |column| column[:label] }
          tbl[:rows].each do |row|
            csv << tbl[:columns].map { |column| csv_cell(row[column[:key]]) }
          end
          csv << [] if index < tables.length - 1
        end
      end
    end

    def export_filename
      "#{self.class.key}_#{range.slug}_#{Date.current.iso8601}.csv"
    end

    protected

    def headline_figures
      []
    end

    def charts
      []
    end

    def tables
      []
    end

    def notes
      []
    end

    def empty?
      tables.all? { |tbl| tbl[:rows].blank? } &&
        headline_figures.none? { |figure| numeric_presence?(figure[:value]) }
    end

    def live_applications
      PermitApplication.kept.live
    end

    def live_projects
      PermitProject.kept.live
    end

    def submitted_applications
      live_applications.where("#{FIRST_SUBMITTED_AT_SQL} IS NOT NULL")
    end

    def created_in_range
      range.apply(live_applications, "permit_applications.created_at")
    end

    def submitted_in_range
      range.apply(submitted_applications, FIRST_SUBMITTED_AT_SQL)
    end

    def figure(key, value, approximate: false, help_overrides: {})
      {
        key: key,
        label: I18n.t("reports.#{self.class.key}.figures.#{key}.label"),
        value: value,
        help_text:
          I18n.t(
            "reports.#{self.class.key}.figures.#{key}.help",
            **{ range: range.label }.merge(help_overrides)
          ),
        approximate: approximate
      }
    end

    def chart(key, type, x_key:, series:, data:, record_count:)
      suppressed = record_count < SMALL_N
      {
        key: key,
        type: type,
        x_key: x_key,
        series: series,
        data: suppressed ? [] : data,
        suppressed: suppressed,
        suppression_reason:
          (I18n.t("reports.small_n", count: record_count) if suppressed),
        record_count: record_count
      }
    end

    def table(key, columns, rows)
      {
        key: key,
        columns:
          columns.map do |column|
            { key: column[:key].to_s, label: column[:label] }
          end,
        rows:
          rows.map do |row|
            row.respond_to?(:stringify_keys) ? row.stringify_keys : row
          end
      }
    end

    def note(key, kind)
      {
        key: key,
        kind: kind,
        text: I18n.t("reports.#{self.class.key}.notes.#{key}")
      }
    end

    def counts_by_month(scope, timestamp_sql)
      grouped =
        scope.group(Arel.sql("date_trunc('month', #{timestamp_sql})")).count
      grouped_by_month =
        grouped.each_with_object({}) do |(key, count), memo|
          next if key.blank?

          memo[key.to_date.beginning_of_month] = count.to_i
        end

      months_in_range(scope, timestamp_sql).map do |month|
        {
          "period" => month.strftime("%Y-%m"),
          "count" => grouped_by_month[month].to_i
        }
      end
    end

    def months_in_range(scope, timestamp_sql)
      last = range.end_date.to_date.beginning_of_month
      first =
        if range.all_time?
          earliest = scope.pick(Arel.sql("MIN(#{timestamp_sql})"))
          (earliest&.to_date || last).beginning_of_month
        else
          range.start_date.to_date.beginning_of_month
        end

      months = []
      current = first
      while current <= last
        months << current
        current = current.next_month
      end
      months
    end

    def growth_figure(key, current, previous)
      current = current.to_i
      previous = previous.to_i
      if previous < GROWTH_MIN_BASE
        figure(
          key,
          "#{previous} -> #{current}",
          help_overrides: {
            change: I18n.t("reports.growth.suppressed")
          }
        ).merge(direction: "suppressed")
      else
        pct = ((current - previous).to_f / previous * 100).round(1)
        direction = (pct.positive? ? "up" : (pct.negative? ? "down" : "flat"))
        sign = pct.positive? ? "+" : ""
        figure(
          key,
          "#{sign}#{pct}% (#{previous} -> #{current})",
          help_overrides: {
            change: "#{sign}#{pct}%"
          }
        ).merge(direction: direction)
      end
    end

    def median(values)
      numbers = values.compact.map(&:to_f)
      return nil if numbers.empty?

      sorted = numbers.sort
      mid = sorted.length / 2
      sorted.length.odd? ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2.0
    end

    def round_days(seconds)
      return nil if seconds.nil?

      (seconds.to_f / 1.day).round(1)
    end

    private

    def numeric_presence?(value)
      case value
      when nil, "", 0, "0"
        false
      else
        true
      end
    end

    def csv_cell(value)
      value.nil? ? "" : value
    end
  end
end
