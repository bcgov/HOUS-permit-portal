module Reports
  class ApplicationGrowth < Base
    def headline_figures
      [
        figure("total_created", created_in_range.count),
        figure("total_submitted", submitted_in_range.count),
        figure("cumulative_processed", submitted_applications.count),
        growth_figure(
          "mom_submissions",
          submitted_between(current_month),
          submitted_between(previous_month)
        ),
        growth_figure(
          "qoq_submissions",
          submitted_between(current_quarter),
          submitted_between(previous_quarter)
        ),
        growth_figure(
          "mom_accounts",
          accounts_between(current_month),
          accounts_between(previous_month)
        ),
        growth_figure(
          "qoq_accounts",
          accounts_between(current_quarter),
          accounts_between(previous_quarter)
        )
      ]
    end

    def charts
      [
        chart(
          "by_month",
          "bar",
          x_key: "period",
          series: [
            {
              key: "created",
              label: I18n.t("reports.application_growth.series.created")
            },
            {
              key: "submitted",
              label: I18n.t("reports.application_growth.series.submitted")
            }
          ],
          data: monthly_rows,
          record_count: created_in_range.count + submitted_in_range.count
        )
      ]
    end

    def tables
      [
        table(
          "by_month",
          [column("period"), column("created"), column("submitted")],
          monthly_rows
        ),
        table("by_status", [column("status"), column("count")], status_rows)
      ]
    end

    def notes
      [
        note("created_not_submitted", "definition"),
        note("cumulative_independent", "definition"),
        note("growth_small_base", "definition")
      ]
    end

    def empty?
      created_in_range.none? && submitted_applications.none?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.application_growth.columns.#{key}") }
    end

    def monthly_rows
      @monthly_rows ||=
        begin
          created =
            counts_by_month(
              created_in_range,
              "permit_applications.created_at"
            ).index_by { |row| row["period"] }
          submitted =
            counts_by_month(
              submitted_in_range,
              FIRST_SUBMITTED_AT_SQL
            ).index_by { |row| row["period"] }
          (created.keys + submitted.keys).uniq.sort.map do |period|
            {
              "period" => period,
              "created" => created.dig(period, "count").to_i,
              "submitted" => submitted.dig(period, "count").to_i
            }
          end
        end
    end

    def status_rows
      created_in_range
        .group(:status)
        .count
        .map do |status, count|
          {
            "status" => normalize_status(status).humanize,
            "count" => count.to_i
          }
        end
        .sort_by { |row| row["status"] }
    end

    def normalize_status(status)
      return status.to_s if PermitApplication.statuses.key?(status.to_s)

      PermitApplication.statuses.key(status.to_i).to_s
    end

    def submitted_between(period)
      submitted_applications.where(
        "#{FIRST_SUBMITTED_AT_SQL} BETWEEN ? AND ?",
        period.begin,
        period.end
      ).count
    end

    def accounts_between(period)
      User.kept.where(created_at: period).count
    end

    def current_month
      Time.current.beginning_of_month..Time.current.end_of_day
    end

    def previous_month
      start = Time.current.last_month.beginning_of_month
      start..start.end_of_month
    end

    def current_quarter
      Time.current.beginning_of_quarter..Time.current.end_of_day
    end

    def previous_quarter
      start = Time.current.last_quarter.beginning_of_quarter
      start..start.end_of_quarter
    end
  end
end
