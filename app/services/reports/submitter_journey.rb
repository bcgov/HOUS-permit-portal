module Reports
  class SubmitterJourney < Base
    STEPS = %w[created started submitted issued].freeze
    DROP_LABELS = {
      "started" => "did_not_start",
      "submitted" => "did_not_submit",
      "issued" => "not_issued"
    }.freeze

    def headline_figures
      [
        figure("created", created_count),
        figure("started_share", percent_value(started_count, created_count)),
        figure(
          "submitted_share",
          percent_value(submitted_count, created_count)
        ),
        figure("issued_share", percent_value(issued_count, created_count))
      ]
    end

    def charts
      [
        chart(
          "funnel_steps",
          "funnel",
          x_key: "step",
          series: [
            {
              key: "count",
              label: I18n.t("reports.submitter_journey.series.projects")
            }
          ],
          data: step_rows,
          record_count: created_count
        )
      ]
    end

    def tables
      [
        table(
          "funnel_steps",
          [column("step"), column("count"), column("share"), column("dropped")],
          step_rows,
          sortable: false
        )
      ]
    end

    def notes
      [
        note("projects_not_applications", "definition"),
        note("any_application", "definition"),
        note("milestones_after_range", "definition"),
        note("issued_is_not_abandonment", "caveat")
      ]
    end

    def empty?
      created_count.zero?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.submitter_journey.columns.#{key}") }
    end

    def cohort
      @cohort ||= range.apply(live_projects, "permit_projects.created_at")
    end

    def created_count
      @created_count ||= cohort.count
    end

    def started_count
      @started_count ||= reaching(kept_applications).count
    end

    def submitted_count
      @submitted_count ||=
        reaching(kept_applications.joins(:submission_versions)).count
    end

    def issued_count
      @issued_count ||=
        reaching(
          kept_applications
            .joins(:submission_versions)
            .where.not(issued_at: nil)
        ).count
    end

    def reaching(applications)
      cohort.where(id: applications.select(:permit_project_id))
    end

    def kept_applications
      PermitApplication.kept
    end

    def step_rows
      @step_rows ||= build_step_rows
    end

    def build_step_rows
      counts = {
        "created" => created_count,
        "started" => started_count,
        "submitted" => submitted_count,
        "issued" => issued_count
      }
      previous = nil
      STEPS.map do |step|
        count = counts.fetch(step)
        dropped = previous.nil? ? 0 : previous - count
        share = percent_value(count, created_count) || "0.0%"
        previous = count
        {
          "step" => I18n.t("reports.submitter_journey.steps.#{step}"),
          "step_key" => step,
          "count" => count,
          "share" => share,
          "dropped" => dropped,
          "drop_label" => drop_label(step, dropped, share)
        }
      end
    end

    def drop_label(step, dropped, share)
      key = DROP_LABELS[step]
      return "" unless key

      I18n.t(
        "reports.submitter_journey.drops.#{key}",
        dropped: dropped,
        share: share
      )
    end
  end
end
