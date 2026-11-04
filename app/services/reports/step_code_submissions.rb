module Reports
  # Rows are attached step codes on a submitted permit application. One row
  # per step code, dated by the application's first submission version.
  # Standalone step code reports are not included.
  module StepCodeSubmissions
    def headline_figures
      [
        figure("total_submissions", rows.length),
        figure("pass_count", rows_with_outcome("pass").length),
        figure("fail_count", rows_with_outcome("fail").length),
        figure("incomplete_count", rows_with_outcome("incomplete").length)
      ]
    end

    def charts
      label = I18n.t("#{i18n_base}.series.submissions")
      super.map do |chart_payload|
        chart_payload.merge(
          series:
            chart_payload[:series].map { |series| series.merge(label: label) }
        )
      end
    end

    def tables
      [
        table(
          "by_month",
          [
            column("period"),
            column("count", "#{i18n_base}.columns.submissions")
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
            column("label", "#{i18n_base}.columns.outcome"),
            column("count", "#{i18n_base}.columns.submissions")
          ],
          outcome_rows
        ),
        table(
          "energy_step",
          [
            column("label", "#{i18n_base}.columns.energy_step"),
            column("count", "#{i18n_base}.columns.submissions")
          ],
          energy_step_rows
        ),
        table(
          "zero_carbon_step",
          [
            column("label", "#{i18n_base}.columns.zero_carbon_step"),
            column("count", "#{i18n_base}.columns.submissions")
          ],
          zero_carbon_step_rows
        )
      ]
    end

    def load_rows
      submitted_at_by_application = first_submitted_at

      submitted_scope
        .includes(
          :jurisdiction,
          checklist_includes,
          permit_application: {
            permit_project: :jurisdiction
          }
        )
        .filter_map do |step_code|
          submitted_at =
            submitted_at_by_application[step_code.permit_application_id]
          next unless submitted_at

          outcome, energy_step, zero_carbon_step =
            classify(step_code.current_checklist)
          {
            "step_code_id" => step_code.id,
            "jurisdiction_id" => step_code.jurisdiction&.id,
            "jurisdiction_name" =>
              step_code.jurisdiction&.name ||
                I18n.t("#{i18n_base}.unknown_jurisdiction"),
            "submitted_at" => submitted_at,
            "period" =>
              submitted_at.to_date.beginning_of_month.strftime("%Y-%m"),
            "outcome" => outcome,
            "energy_step" => energy_step,
            "zero_carbon_step" => zero_carbon_step
          }
        end
    end

    def jurisdiction_rows
      grouped = rows.group_by { |row| row["jurisdiction_id"] }
      enabled_ids = enabled_jurisdiction_ids

      list =
        Jurisdiction
          .order(:name)
          .filter_map do |jurisdiction|
            group = grouped[jurisdiction.id] || []
            next if group.empty?

            {
              "jurisdiction" => jurisdiction.name,
              "jurisdiction_slug" => jurisdiction.slug,
              "submissions" => group.length,
              "enablement" =>
                I18n.t(
                  "#{i18n_base}.enablement.#{enabled_ids.include?(jurisdiction.id) ? "enabled" : "not_enabled"}"
                )
            }
          end

      unknown = grouped[nil] || []
      if unknown.any?
        list << {
          "jurisdiction" => I18n.t("#{i18n_base}.unknown_jurisdiction"),
          "submissions" => unknown.length,
          "enablement" => I18n.t("#{i18n_base}.enablement.enabled")
        }
      end
      list
    end

    def each_export_context
      submitted_at_by_application = first_submitted_at

      step_code_class
        .where(id: submitted_scope.select("step_codes.id"))
        .includes(
          :jurisdiction,
          checklists: %i[data_entries building_characteristics_summary],
          permit_application: {
            permit_project: :jurisdiction
          }
        )
        .find_each do |step_code|
          submitted_at =
            submitted_at_by_application[step_code.permit_application_id]
          next unless submitted_at

          checklist = step_code.current_checklist
          outcome, energy_step, zero_carbon_step = classify(checklist)
          yield(
            {
              step_code: step_code,
              checklist: checklist,
              data_entry: checklist&.data_entries&.first,
              submitted_at: submitted_at,
              jurisdiction_name:
                step_code.jurisdiction&.name ||
                  I18n.t("#{i18n_base}.unknown_jurisdiction"),
              outcome: outcome,
              energy_step: energy_step,
              zero_carbon_step: zero_carbon_step
            }
          )
        end
    end

    def detail_columns
      StepCodePart9::DETAIL_COLUMNS.filter_map do |column|
        case column[:label]
        when "Stage"
          nil
        when "Completed at"
          column.merge(
            label: "Submission date",
            value: ->(ctx) { ctx[:submitted_at]&.to_date&.iso8601 }
          )
        else
          column
        end
      end
    end

    def submitted_scope
      scope =
        step_code_class
          .kept
          .joins(permit_application: :permit_project)
          .merge(PermitApplication.kept)
          .where(permit_projects: { sandbox_id: nil })
          .where("#{Base::FIRST_SUBMITTED_AT_SQL} IS NOT NULL")
      range.apply(scope, Base::FIRST_SUBMITTED_AT_SQL)
    end

    def first_submitted_at
      SubmissionVersion
        .where(
          permit_application_id:
            submitted_scope.select("permit_applications.id")
        )
        .group(:permit_application_id)
        .minimum(:created_at)
    end
  end
end
