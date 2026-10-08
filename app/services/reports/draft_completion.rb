module Reports
  class DraftCompletion < Base
    SUBJECTS = %w[applications projects].freeze
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
        note("first_submitted", "definition"),
        note("completion_definition", "definition"),
        note("range_boundary", "definition"),
        note("abandonment_definition", "definition")
      ]
    end

    def export_filename
      "#{self.class.key}_#{subject}_#{range.slug}_#{Date.current.iso8601}.csv"
    end

    def empty?
      created_count.zero? && open_drafts.none? && submitted_in_range.none?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.draft_completion.columns.#{key}") }
    end

    def subject
      SUBJECTS.include?(@subject) ? @subject : "applications"
    end

    def projects?
      subject == "projects"
    end

    def term_interpolations
      {
        record: I18n.t("reports.draft_completion.subjects.#{subject}.record"),
        records: I18n.t("reports.draft_completion.subjects.#{subject}.records"),
        records_title:
          I18n.t("reports.draft_completion.subjects.#{subject}.records_title"),
        first_submitted:
          I18n.t("reports.draft_completion.subjects.#{subject}.first_submitted")
      }
    end

    def figure(key, value, approximate: false, help_overrides: {})
      super(
        key,
        value,
        approximate: approximate,
        help_overrides: term_interpolations.merge(help_overrides)
      )
    end

    def note(key, kind)
      {
        key: key,
        kind: kind,
        text:
          I18n.t("reports.draft_completion.notes.#{key}", **term_interpolations)
      }
    end

    def created_count
      @created_count ||= created_in_range.count
    end

    def submitted_created_in_range
      @submitted_created_in_range ||=
        range.apply(
          created_in_range.where("#{submitted_at_sql} IS NOT NULL"),
          submitted_at_sql
        ).count
    end

    def created_before_submitted_in_range_count
      @created_before_submitted_in_range_count ||=
        if range.all_time?
          0
        else
          submitted_in_range.where(
            "#{created_column} < ?",
            range.start_date
          ).count
        end
    end

    def median_draft_to_submit_days
      pairs = submitted_in_range.pluck(:created_at, Arel.sql(submitted_at_sql))
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
          .where(draft_condition)
          .where("#{updated_column} <= ?", 90.days.ago)
          .count
    end

    def open_drafts
      @open_drafts ||= records.where(draft_condition)
    end

    def stale_rows
      STALE_BUCKETS.map do |key, min_age, max_age|
        scope = open_drafts.where("#{updated_column} <= ?", min_age.ago)
        scope = scope.where("#{updated_column} > ?", max_age.ago) if max_age
        {
          "bucket" => I18n.t("reports.draft_completion.buckets.#{key}"),
          "count" => scope.count
        }
      end
    end

    def records
      projects? ? live_projects : live_applications
    end

    def created_in_range
      range.apply(records, created_column)
    end

    def submitted_in_range
      range.apply(
        records.where("#{submitted_at_sql} IS NOT NULL"),
        submitted_at_sql
      )
    end

    def created_column
      if projects?
        "permit_projects.created_at"
      else
        "permit_applications.created_at"
      end
    end

    def updated_column
      if projects?
        "permit_projects.updated_at"
      else
        "permit_applications.updated_at"
      end
    end

    def submitted_at_sql
      projects? ? "permit_projects.enqueued_at" : FIRST_SUBMITTED_AT_SQL
    end

    def draft_condition
      projects? ? { state: :draft } : { status: :new_draft }
    end
  end
end
