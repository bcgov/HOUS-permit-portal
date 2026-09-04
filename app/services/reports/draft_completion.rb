module Reports
  class DraftCompletion < Base
    STALE_BUCKETS = [
      ["stale_30", 30.days, 60.days],
      ["stale_60", 60.days, 90.days],
      ["stale_90", 90.days, nil]
    ].freeze

    def headline_figures
      [
        figure(
          "completion_rate",
          percent_value(submitted_created_in_range, created_count)
        ),
        figure("median_draft_to_submit_days", median_draft_to_submit_days),
        figure(
          "abandonment_rate",
          percent_value(abandoned_count, created_count)
        ),
        figure(
          "created_before_submitted_in_range",
          created_before_submitted_in_range_count
        )
      ]
    end

    def charts
      [
        chart(
          "stale_drafts",
          "bar",
          x_key: "bucket",
          series: [
            {
              key: "count",
              label: I18n.t("reports.draft_completion.series.drafts")
            }
          ],
          data: stale_rows,
          record_count: open_drafts.count
        )
      ]
    end

    def tables
      [table("stale_drafts", [column("bucket"), column("count")], stale_rows)]
    end

    def notes
      [
        note("completion_definition", "definition"),
        note("range_boundary", "definition"),
        note("abandonment_definition", "definition")
      ]
    end

    def empty?
      created_count.zero? && open_drafts.none? && submitted_in_range.none?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.draft_completion.columns.#{key}") }
    end

    def created_count
      @created_count ||= created_in_range.count
    end

    def submitted_created_in_range
      @submitted_created_in_range ||=
        range.apply(
          created_in_range.where("#{FIRST_SUBMITTED_AT_SQL} IS NOT NULL"),
          FIRST_SUBMITTED_AT_SQL
        ).count
    end

    def created_before_submitted_in_range_count
      @created_before_submitted_in_range_count ||=
        if range.all_time?
          0
        else
          submitted_in_range.where(
            "permit_applications.created_at < ?",
            range.start_date
          ).count
        end
    end

    def median_draft_to_submit_days
      pairs =
        submitted_in_range.pluck(:created_at, Arel.sql(FIRST_SUBMITTED_AT_SQL))
      seconds =
        pairs.filter_map do |created_at, submitted_at|
          next if created_at.blank? || submitted_at.blank?

          submitted_at - created_at
        end
      round_days(median(seconds))
    end

    def abandoned_count
      @abandoned_count ||=
        created_in_range
          .where(status: :new_draft)
          .where("permit_applications.updated_at <= ?", 90.days.ago)
          .count
    end

    def open_drafts
      @open_drafts ||= live_applications.where(status: :new_draft)
    end

    def stale_rows
      STALE_BUCKETS.map do |key, min_age, max_age|
        scope =
          open_drafts.where("permit_applications.updated_at <= ?", min_age.ago)
        scope =
          scope.where(
            "permit_applications.updated_at > ?",
            max_age.ago
          ) if max_age
        {
          "bucket" => I18n.t("reports.draft_completion.buckets.#{key}"),
          "count" => scope.count
        }
      end
    end
  end
end
