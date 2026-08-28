module Reports
  class StepCodePart9 < Base
    def headline_figures
      [
        figure("total_submissions", rows.length),
        figure("pass_count", outcome_counts["pass"]),
        figure("fail_count", outcome_counts["fail"]),
        figure("incomplete_count", outcome_counts["incomplete"])
      ]
    end

    def charts
      count = rows.length
      [
        chart(
          "by_month",
          "bar",
          x_key: "period",
          series: [
            {
              key: "count",
              label: I18n.t("reports.step_code_part_9.series.submissions")
            }
          ],
          data: by_month,
          record_count: count
        ),
        chart(
          "outcomes",
          "bar",
          x_key: "label",
          series: [
            {
              key: "count",
              label: I18n.t("reports.step_code_part_9.series.submissions")
            }
          ],
          data: outcome_rows,
          record_count: count
        ),
        chart(
          "energy_step",
          "bar",
          x_key: "label",
          series: [
            {
              key: "count",
              label: I18n.t("reports.step_code_part_9.series.submissions")
            }
          ],
          data: energy_step_rows,
          record_count: count
        ),
        chart(
          "zero_carbon_step",
          "bar",
          x_key: "label",
          series: [
            {
              key: "count",
              label: I18n.t("reports.step_code_part_9.series.submissions")
            }
          ],
          data: zero_carbon_step_rows,
          record_count: count
        )
      ]
    end

    def tables
      [
        table(
          "by_month",
          [
            column("period"),
            column("count", "reports.step_code_part_9.columns.submissions")
          ],
          by_month
        ),
        table(
          "by_jurisdiction",
          [column("jurisdiction"), column("submissions"), column("enablement")],
          jurisdiction_rows
        ),
        table(
          "outcomes",
          [
            column("label", "reports.step_code_part_9.columns.outcome"),
            column("count")
          ],
          outcome_rows
        ),
        table(
          "energy_step",
          [
            column("label", "reports.step_code_part_9.columns.energy_step"),
            column("count")
          ],
          energy_step_rows
        ),
        table(
          "zero_carbon_step",
          [
            column(
              "label",
              "reports.step_code_part_9.columns.zero_carbon_step"
            ),
            column("count")
          ],
          zero_carbon_step_rows
        )
      ]
    end

    def notes
      [
        note("incomplete_not_fail", "definition"),
        note("enablement", "definition"),
        note("small_n", "definition")
      ]
    end

    def empty?
      rows.empty?
    end

    protected

    def rows
      @rows ||= load_rows
    end

    def load_rows
      first_submitted =
        SubmissionVersion
          .where(
            permit_application_id:
              submitted_scope.select("permit_applications.id")
          )
          .group(:permit_application_id)
          .minimum(:created_at)

      submitted_scope
        .includes(
          :jurisdiction,
          checklists: :data_entries,
          permit_application: {
            permit_project: :jurisdiction
          }
        )
        .filter_map do |step_code|
          submitted_at = first_submitted[step_code.permit_application_id]
          next unless submitted_at

          outcome, energy_step, zero_carbon_step =
            classify(step_code.current_checklist)
          {
            "jurisdiction_id" => step_code.jurisdiction&.id,
            "jurisdiction_name" =>
              step_code.jurisdiction&.name ||
                I18n.t("reports.step_code_part_9.unknown_jurisdiction"),
            "submitted_at" => submitted_at,
            "period" =>
              submitted_at.to_date.beginning_of_month.strftime("%Y-%m"),
            "outcome" => outcome,
            "energy_step" => energy_step,
            "zero_carbon_step" => zero_carbon_step
          }
        end
    end

    def submitted_scope
      scope =
        Part9StepCode
          .kept
          .joins(permit_application: :permit_project)
          .merge(PermitApplication.kept)
          .where(permit_projects: { sandbox_id: nil })
          .where("#{FIRST_SUBMITTED_AT_SQL} IS NOT NULL")
      range.apply(scope, FIRST_SUBMITTED_AT_SQL)
    end

    def classify(checklist)
      if checklist.nil? || checklist.data_entries.none?
        return "incomplete", nil, nil
      end

      reports = checklist.compliance_reports
      return "incomplete", nil, nil if reports.blank?

      selected =
        reports.find do |report|
          report[:requirement_id] == checklist.step_requirement_id
        end
      passing =
        reports.find do |report|
          report.dig(:energy)&.step && report.dig(:zero_carbon)&.step
        end
      report = selected || passing || reports.first
      energy = report.dig(:energy)&.step
      zero_carbon = report.dig(:zero_carbon)&.step
      outcome = energy && zero_carbon ? "pass" : "fail"
      [outcome, energy, zero_carbon]
    end

    def by_month
      counts = rows.group_by { |row| row["period"] }.transform_values(&:length)
      periods = counts.keys.sort
      return [] if periods.empty?

      start_month = Date.strptime(periods.first, "%Y-%m")
      end_month = Date.strptime(periods.last, "%Y-%m")
      months = []
      current = start_month
      while current <= end_month
        key = current.strftime("%Y-%m")
        months << { "period" => key, "count" => counts[key].to_i }
        current = current.next_month
      end
      months
    end

    def outcome_counts
      @outcome_counts ||= { "pass" => 0, "fail" => 0, "incomplete" => 0 }.merge(
        rows.group_by { |row| row["outcome"] }.transform_values(&:length)
      )
    end

    def outcome_rows
      %w[pass fail incomplete].map do |key|
        {
          "label" => I18n.t("reports.step_code_part_9.outcomes.#{key}"),
          "count" => outcome_counts[key].to_i
        }
      end
    end

    def energy_step_rows
      step_distribution("energy_step", "reports.step_code_part_9.energy_step")
    end

    def zero_carbon_step_rows
      step_distribution(
        "zero_carbon_step",
        "reports.step_code_part_9.zero_carbon_step"
      )
    end

    def step_distribution(field, i18n_prefix)
      grouped = rows.group_by { |row| row[field] }
      labels =
        grouped.keys.compact.sort.map do |step|
          [step, I18n.t(i18n_prefix, step: step)]
        end
      incomplete = grouped[nil]&.length.to_i
      rows_out =
        labels.map do |step, label|
          { "label" => label, "count" => grouped[step].length }
        end
      if incomplete.positive?
        rows_out << {
          "label" => I18n.t("reports.step_code_part_9.outcomes.incomplete"),
          "count" => incomplete
        }
      end
      rows_out
    end

    def jurisdiction_rows
      submission_counts =
        rows
          .group_by { |row| row["jurisdiction_id"] }
          .transform_values(&:length)
      enabled_ids = JurisdictionStepRequirement.distinct.pluck(:jurisdiction_id)

      Jurisdiction
        .order(:name)
        .map do |jurisdiction|
          enabled = enabled_ids.include?(jurisdiction.id)
          count = submission_counts[jurisdiction.id].to_i
          enablement =
            if enabled
              count.positive? ? "has_submissions" : "enabled_no_submissions"
            else
              "not_enabled"
            end
          {
            "jurisdiction" => jurisdiction.name,
            "submissions" => count,
            "enablement" =>
              I18n.t("reports.step_code_part_9.enablement.#{enablement}")
          }
        end
        .tap do |list|
          unknown = submission_counts[nil].to_i
          if unknown.positive?
            list << {
              "jurisdiction" =>
                I18n.t("reports.step_code_part_9.unknown_jurisdiction"),
              "submissions" => unknown,
              "enablement" =>
                I18n.t("reports.step_code_part_9.enablement.has_submissions")
            }
          end
        end
    end

    def column(key, i18n_key = nil)
      {
        key: key,
        label: I18n.t(i18n_key || "reports.step_code_part_9.columns.#{key}")
      }
    end
  end
end
