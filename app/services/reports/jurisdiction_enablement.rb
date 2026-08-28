module Reports
  class JurisdictionEnablement < Base
    def headline_figures
      [
        figure("currently_enabled", currently_enabled_count),
        figure("previously_enabled", previously_enabled_count),
        figure("never_enabled", never_enabled_count),
        figure("active", active_count),
        figure("enabled_never_submitted", enabled_never_submitted_count)
      ]
    end

    def charts
      [
        chart(
          "enabled_by_quarter",
          "bar",
          x_key: "period",
          series: [
            {
              key: "count",
              label:
                I18n.t(
                  "reports.jurisdiction_enablement.series.enabled_by_quarter"
                )
            }
          ],
          data: enabled_by_quarter,
          record_count: jurisdiction_rows.length
        ),
        chart(
          "submission_cohorts",
          "bar",
          x_key: "period",
          series: [
            {
              key: "count",
              label:
                I18n.t(
                  "reports.jurisdiction_enablement.series.submission_cohorts"
                )
            }
          ],
          data: submission_cohorts,
          record_count:
            jurisdiction_rows.count { |row| row["first_submitted_on"].present? }
        )
      ]
    end

    def tables
      [
        table(
          "jurisdictions",
          [
            column("jurisdiction"),
            column("status"),
            column("currently_enabled"),
            column("first_enabled_on"),
            column("last_changed_on"),
            column("cumulative_days"),
            column("submissions_in_range"),
            column("days_to_first_submission"),
            column("approximate")
          ],
          jurisdiction_rows.map do |row|
            row.except(
              "first_submitted_on",
              "churned",
              "never_enabled",
              "active"
            )
          end
        )
      ]
    end

    def notes
      [
        note("active_definition", "definition"),
        note("approximate", "definition"),
        note("enabled_time", "definition"),
        note("churned_kept", "definition")
      ]
    end

    def empty?
      jurisdiction_rows.empty?
    end

    private

    def column(key)
      {
        key: key,
        label: I18n.t("reports.jurisdiction_enablement.columns.#{key}")
      }
    end

    def currently_enabled_count
      jurisdiction_rows.count { |row| row["currently_enabled"] == yes }
    end

    def previously_enabled_count
      jurisdiction_rows.count { |row| row["churned"] }
    end

    def never_enabled_count
      jurisdiction_rows.count { |row| row["never_enabled"] }
    end

    def active_count
      jurisdiction_rows.count { |row| row["active"] }
    end

    def enabled_never_submitted_count
      jurisdiction_rows.count do |row|
        row["currently_enabled"] == yes && row["first_submitted_on"].blank?
      end
    end

    def enabled_by_quarter
      counts =
        jurisdiction_rows.each_with_object(Hash.new(0)) do |row, memo|
          date = parse_date(row["first_enabled_on"])
          next unless date
          next unless in_range?(date)

          memo[date.beginning_of_quarter] += 1
        end
      quarter_rows(counts)
    end

    def submission_cohorts
      counts =
        jurisdiction_rows.each_with_object(Hash.new(0)) do |row, memo|
          date = parse_date(row["first_submitted_on"])
          next unless date
          next unless in_range?(date)

          memo[date.beginning_of_quarter] += 1
        end
      quarter_rows(counts)
    end

    def quarter_rows(counts)
      return [] if counts.empty?

      current = counts.keys.min
      last = [counts.keys.max, range.end_date.to_date.beginning_of_quarter].max
      rows = []
      while current <= last
        rows << {
          "period" => "#{current.year}-Q#{(current.month / 3.0).ceil}",
          "count" => counts[current].to_i
        }
        current = current.next_quarter
      end
      rows
    end

    def jurisdiction_rows
      @jurisdiction_rows ||=
        Jurisdiction.order(:name).map { |jurisdiction| row_for(jurisdiction) }
    end

    def row_for(jurisdiction)
      history =
        EnablementHistory.new(events_by_jurisdiction[jurisdiction.id] || [])
      currently = jurisdiction.inbox_enabled?
      first_enabled_at = history.first_enabled_at
      first_submitted_at = first_submitted_at_by_jurisdiction[jurisdiction.id]
      submissions = submissions_in_range_by_jurisdiction[jurisdiction.id].to_i
      approximate =
        history.approximate? || (currently && history.first_enabled_at.nil?)
      churned = !currently && first_enabled_at.present?
      never_enabled = !currently && first_enabled_at.nil?
      active = currently && submissions.positive?

      {
        "jurisdiction" =>
          jurisdiction.qualified_name.presence || jurisdiction.name,
        "status" => status_label(currently, active, churned, never_enabled),
        "currently_enabled" => currently ? yes : no,
        "first_enabled_on" => format_date(first_enabled_at),
        "last_changed_on" => format_date(history.last_changed_at),
        "cumulative_days" =>
          (history.cumulative_days if history.first_enabled_at),
        "submissions_in_range" => submissions,
        "days_to_first_submission" =>
          history.days_to_first_submission(first_submitted_at),
        "approximate" => approximate ? yes : no,
        "first_submitted_on" => format_date(first_submitted_at),
        "churned" => churned,
        "never_enabled" => never_enabled,
        "active" => active
      }
    end

    def status_label(currently, active, churned, never_enabled)
      if never_enabled
        I18n.t("reports.jurisdiction_enablement.status.never_enabled")
      elsif churned
        I18n.t("reports.jurisdiction_enablement.status.previously_enabled")
      elsif active
        I18n.t("reports.jurisdiction_enablement.status.active")
      elsif currently
        I18n.t("reports.jurisdiction_enablement.status.enabled_no_submissions")
      else
        I18n.t("reports.jurisdiction_enablement.status.never_enabled")
      end
    end

    def events_by_jurisdiction
      @events_by_jurisdiction ||=
        JurisdictionEnablementEvent.inbox.chronological.group_by(
          &:jurisdiction_id
        )
    end

    def submissions_in_range_by_jurisdiction
      @submissions_in_range_by_jurisdiction ||=
        submitted_in_range.group("permit_projects.jurisdiction_id").count
    end

    def first_submitted_at_by_jurisdiction
      @first_submitted_at_by_jurisdiction ||=
        SubmissionVersion
          .joins(permit_application: :permit_project)
          .merge(PermitApplication.kept)
          .merge(PermitProject.live)
          .group("permit_projects.jurisdiction_id")
          .minimum(:created_at)
    end

    def in_range?(date)
      return true if range.all_time?

      date.to_date >= range.start_date.to_date &&
        date.to_date <= range.end_date.to_date
    end

    def parse_date(value)
      return if value.blank?

      Date.iso8601(value)
    end

    def format_date(value)
      value&.to_date&.iso8601
    end

    def yes
      I18n.t("reports.jurisdiction_enablement.yes")
    end

    def no
      I18n.t("reports.jurisdiction_enablement.no")
    end
  end
end
