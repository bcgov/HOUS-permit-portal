module Reports
  class ApplicationGrowth < Base
    def headline_figures
      [figure("total_created", created_in_range.count)]
    end

    def charts
      rows = monthly_created
      [
        chart(
          "created_by_month",
          "bar",
          x_key: "period",
          series: [
            {
              key: "count",
              label: I18n.t("reports.application_growth.series.created")
            }
          ],
          data: rows,
          record_count: created_in_range.count
        )
      ]
    end

    def tables
      [
        table(
          "created_by_month",
          [
            {
              key: "period",
              label: I18n.t("reports.application_growth.columns.period")
            },
            {
              key: "count",
              label: I18n.t("reports.application_growth.columns.created")
            }
          ],
          monthly_created
        )
      ]
    end

    def notes
      [note("created_not_submitted", "definition")]
    end

    def empty?
      created_in_range.none?
    end

    private

    def monthly_created
      @monthly_created ||=
        counts_by_month(created_in_range, "permit_applications.created_at")
    end
  end
end
