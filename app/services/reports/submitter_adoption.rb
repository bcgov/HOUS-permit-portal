module Reports
  class SubmitterAdoption < Base
    SUBJECTS = %w[applications projects].freeze

    def headline_figures
      [
        figure("first_time", first_time_count),
        figure("returning", returning_count),
        figure(
          "first_time_share",
          percent_value(first_time_count, submitters_in_range.length)
        ),
        figure(
          "returning_share",
          percent_value(returning_count, submitters_in_range.length)
        ),
        figure("never_started", never_started_count),
        figure("mean_applications", mean_applications)
      ]
    end

    def charts
      [
        chart(
          "submitter_mix",
          "bar",
          x_key: "group",
          series: [
            {
              key: "count",
              label: I18n.t("reports.submitter_adoption.series.submitters")
            }
          ],
          data: mix_rows,
          record_count: submitters_in_range.length
        )
      ]
    end

    def tables
      [
        table(
          "submitter_mix",
          [column("group"), column("count"), column("share")],
          mix_rows
        )
      ]
    end

    def notes
      [
        note("terms", "definition"),
        note("returning_definition", "definition"),
        note("never_started", "definition"),
        note("active_submitter", "definition")
      ]
    end

    def export_filename
      "#{self.class.key}_#{subject}_#{range.slug}_#{Date.current.iso8601}.csv"
    end

    def empty?
      submitters_in_range.empty? && never_started_count.zero?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.submitter_adoption.columns.#{key}") }
    end

    def subject
      SUBJECTS.include?(@subject) ? @subject : "applications"
    end

    def term_interpolations
      {
        record: I18n.t("reports.submitter_adoption.subjects.#{subject}.record"),
        records:
          I18n.t("reports.submitter_adoption.subjects.#{subject}.records")
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
          I18n.t(
            "reports.submitter_adoption.notes.#{key}",
            **term_interpolations
          )
      }
    end

    def mix_rows
      [
        {
          "group" => I18n.t("reports.submitter_adoption.groups.first_time"),
          "count" => first_time_count,
          "share" => percent_value(first_time_count, submitters_in_range.length)
        },
        {
          "group" => I18n.t("reports.submitter_adoption.groups.returning"),
          "count" => returning_count,
          "share" => percent_value(returning_count, submitters_in_range.length)
        }
      ]
    end

    def first_time_count
      submitters_in_range.count { |id| lifetime_counts[id].to_i == 1 }
    end

    def returning_count
      submitters_in_range.count { |id| lifetime_counts[id].to_i >= 2 }
    end

    def never_started_count
      @never_started_count ||=
        User.kept.submitter.where.missing(missing_association).count
    end

    def mean_applications
      return nil if lifetime_counts.empty?

      (lifetime_counts.values.sum.to_f / lifetime_counts.length).round(1)
    end

    def submitters_in_range
      @submitters_in_range ||=
        created_records.distinct.pluck(owner_column).compact
    end

    def lifetime_counts
      @lifetime_counts ||=
        records.where.not(owner_column => nil).group(owner_column).count
    end

    def records
      subject == "projects" ? live_projects : live_applications
    end

    def created_records
      range.apply(records, created_column)
    end

    def owner_column
      subject == "projects" ? :owner_id : :submitter_id
    end

    def created_column
      if subject == "projects"
        "permit_projects.created_at"
      else
        "permit_applications.created_at"
      end
    end

    def missing_association
      subject == "projects" ? :permit_projects : :permit_applications
    end
  end
end
