module Reports
  class StepCodePart9 < Base
    STAGES = %w[pre_construction mid_construction as_built].freeze

    def headline_figures
      STAGES.flat_map { |stage| stage_headline_figures(stage) }
    end

    def charts
      count = rows.length
      [
        chart(
          "by_month",
          "bar",
          x_key: "period",
          series: [
            { key: "count", label: I18n.t("#{i18n_base}.series.checklists") }
          ],
          data: by_month,
          record_count: count
        ),
        chart(
          "outcomes",
          "bar",
          x_key: "label",
          series: [
            { key: "count", label: I18n.t("#{i18n_base}.series.checklists") }
          ],
          data: outcome_rows,
          record_count: count
        ),
        chart(
          "energy_step",
          "bar",
          x_key: "label",
          series: [
            { key: "count", label: I18n.t("#{i18n_base}.series.checklists") }
          ],
          data: energy_step_rows,
          record_count: count
        ),
        chart(
          "zero_carbon_step",
          "bar",
          x_key: "label",
          series: [
            { key: "count", label: I18n.t("#{i18n_base}.series.checklists") }
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
          [column("period"), column("count"), column("step_codes")],
          by_month
        ),
        table(
          "by_jurisdiction",
          [
            column("jurisdiction"),
            column("checklists"),
            column("step_codes"),
            column("enablement")
          ],
          jurisdiction_rows
        ),
        table(
          "outcomes",
          [
            column("label", "#{i18n_base}.columns.outcome"),
            column("count"),
            column("step_codes")
          ],
          outcome_rows
        ),
        table(
          "energy_step",
          [
            column("label", "#{i18n_base}.columns.energy_step"),
            column("count"),
            column("step_codes")
          ],
          energy_step_rows
        ),
        table(
          "zero_carbon_step",
          [
            column("label", "#{i18n_base}.columns.zero_carbon_step"),
            column("count"),
            column("step_codes")
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

    def csv_from_payload(_payload)
      columns = detail_columns
      CSV.generate do |csv|
        csv << columns.map { |column| column[:label] }
        each_export_context do |ctx|
          csv << columns.map do |column|
            csv_cell(instance_exec(ctx, &column[:value]))
          end
        end
      end
    end

    def detail_columns
      DETAIL_COLUMNS
    end

    DETAIL_COLUMNS = [
      {
        label: "Application number",
        value: ->(ctx) { ctx[:step_code].permit_application_number },
        feeds_report: false
      },
      {
        label: "Jurisdiction",
        value: ->(ctx) { ctx[:jurisdiction_name] },
        feeds_report: true
      },
      {
        label: "Completed at",
        value: ->(ctx) { ctx[:completed_at]&.to_date&.iso8601 },
        feeds_report: true
      },
      {
        label: "Stage",
        value: ->(ctx) { ctx[:checklist]&.stage },
        feeds_report: false
      },
      {
        label: "Address",
        value: ->(ctx) { ctx[:step_code].full_address },
        feeds_report: false
      },
      {
        label: "Building type",
        value: ->(ctx) { ctx[:checklist]&.building_type },
        feeds_report: false
      },
      {
        label: "Compliance path",
        value: ->(ctx) { ctx[:checklist]&.compliance_path },
        feeds_report: false
      },
      {
        label: "Compliance outcome",
        value: ->(ctx) { ctx[:outcome] },
        feeds_report: true
      },
      {
        label: "Energy step achieved",
        value: ->(ctx) { ctx[:energy_step] },
        feeds_report: true
      },
      {
        label: "Zero carbon step achieved",
        value: ->(ctx) { ctx[:zero_carbon_step] },
        feeds_report: true
      },
      {
        label: "Dwelling units",
        value: ->(ctx) { entry_value(ctx, :dwelling_units_count) },
        feeds_report: false
      },
      {
        label: "Above grade heated floor area",
        value: ->(ctx) { entry_value(ctx, :above_grade_heated_floor_area) },
        feeds_report: false
      },
      {
        label: "Below grade heated floor area",
        value: ->(ctx) { entry_value(ctx, :below_grade_heated_floor_area) },
        feeds_report: false
      },
      {
        label: "Heating degree days",
        value: ->(ctx) { entry_value(ctx, :hdd) },
        feeds_report: false
      },
      {
        label: "Air changes per hour",
        value: ->(ctx) { entry_value(ctx, :ach) },
        feeds_report: false
      },
      {
        label: "Normalized leakage area",
        value: ->(ctx) { entry_value(ctx, :nla) },
        feeds_report: false
      },
      {
        label: "Annual energy consumption",
        value: ->(ctx) { entry_value(ctx, :aec) },
        feeds_report: false
      },
      {
        label: "Reference annual energy consumption",
        value: ->(ctx) { entry_value(ctx, :ref_aec) },
        feeds_report: false
      },
      {
        label: "Building volume",
        value: ->(ctx) { entry_value(ctx, :building_volume) },
        feeds_report: false
      },
      {
        label: "Building envelope surface area",
        value: ->(ctx) { entry_value(ctx, :building_envelope_surface_area) },
        feeds_report: false
      },
      {
        label: "Electrical consumption",
        value: ->(ctx) { entry_value(ctx, :electrical_consumption) },
        feeds_report: false
      },
      {
        label: "Natural gas consumption",
        value: ->(ctx) { entry_value(ctx, :natural_gas_consumption) },
        feeds_report: false
      },
      {
        label: "Propane consumption",
        value: ->(ctx) { entry_value(ctx, :propane_consumption) },
        feeds_report: false
      },
      {
        label: "Hot water energy",
        value: ->(ctx) { entry_value(ctx, :hot_water) },
        feeds_report: false
      },
      {
        label: "Software model",
        value: ->(ctx) { entry_value(ctx, :model) },
        feeds_report: false
      },
      {
        label: "Weather location",
        value: ->(ctx) { entry_value(ctx, :weather_location) },
        feeds_report: false
      },
      {
        label: "Fossil fuels present",
        value: ->(ctx) { fossil_fuels_presence(ctx) },
        feeds_report: false
      }
    ].freeze

    def rows
      @rows ||= load_rows
    end

    def load_rows
      completed_scope
        .includes(checklist_row_includes)
        .filter_map do |checklist|
          completed_at = checklist.stage_completed_at
          next unless completed_at

          step_code = checklist.step_code
          outcome, energy_step, zero_carbon_step = classify(checklist)
          {
            "step_code_id" => step_code.id,
            "jurisdiction_id" => step_code.jurisdiction&.id,
            "jurisdiction_name" =>
              step_code.jurisdiction&.name ||
                I18n.t("#{i18n_base}.unknown_jurisdiction"),
            "completed_at" => completed_at,
            "period" =>
              completed_at.to_date.beginning_of_month.strftime("%Y-%m"),
            "stage" => checklist.stage,
            "outcome" => outcome,
            "energy_step" => energy_step,
            "zero_carbon_step" => zero_carbon_step
          }
        end
    end

    def completed_scope
      range.apply(
        checklist_class.completed_live,
        "#{checklist_class.table_name}.stage_completed_at"
      )
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
      grouped = rows.group_by { |row| row["period"] }
      periods = grouped.keys.sort
      return [] if periods.empty?

      start_month = Date.strptime(periods.first, "%Y-%m")
      end_month = Date.strptime(periods.last, "%Y-%m")
      months = []
      current = start_month
      while current <= end_month
        key = current.strftime("%Y-%m")
        group = grouped[key] || []
        months << {
          "period" => key,
          "count" => group.length,
          "step_codes" => step_code_count(group)
        }
        current = current.next_month
      end
      months
    end

    def outcome_rows
      %w[pass fail incomplete].map do |key|
        group = rows_with_outcome(key)
        {
          "label" => I18n.t("#{i18n_base}.outcomes.#{key}"),
          "count" => group.length,
          "step_codes" => step_code_count(group)
        }
      end
    end

    def energy_step_rows
      step_distribution("energy_step", "#{i18n_base}.energy_step")
    end

    def zero_carbon_step_rows
      step_distribution("zero_carbon_step", "#{i18n_base}.zero_carbon_step")
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
          group = grouped[step]
          {
            "label" => label,
            "count" => group.length,
            "step_codes" => step_code_count(group)
          }
        end
      if incomplete.positive?
        group = grouped[nil]
        rows_out << {
          "label" => I18n.t("#{i18n_base}.outcomes.incomplete"),
          "count" => incomplete,
          "step_codes" => step_code_count(group)
        }
      end
      rows_out
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
              "checklists" => group.length,
              "step_codes" => step_code_count(group),
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
          "checklists" => unknown.length,
          "step_codes" => step_code_count(unknown),
          "enablement" => I18n.t("#{i18n_base}.enablement.enabled")
        }
      end
      list
    end

    def each_export_context
      completed_scope
        .includes(
          :data_entries,
          :building_characteristics_summary,
          step_code: [
            :jurisdiction,
            { permit_application: { permit_project: :jurisdiction } }
          ]
        )
        .find_each do |checklist|
          completed_at = checklist.stage_completed_at
          next unless completed_at

          step_code = checklist.step_code
          outcome, energy_step, zero_carbon_step = classify(checklist)
          yield(
            {
              step_code: step_code,
              checklist: checklist,
              data_entry: checklist.data_entries.first,
              completed_at: completed_at,
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

    def entry_value(ctx, field)
      ctx[:data_entry]&.public_send(field)
    end

    def fossil_fuels_presence(ctx)
      ctx[:checklist]&.building_characteristics_summary&.fossil_fuels&.presence
    end

    def checklist_class
      Part9StepCode::Checklist
    end

    def checklist_row_includes
      [
        :data_entries,
        {
          step_code: [
            :jurisdiction,
            { permit_application: { permit_project: :jurisdiction } }
          ]
        }
      ]
    end

    def rows_with_outcome(outcome)
      rows.select { |row| row["outcome"] == outcome }
    end

    def step_code_count(group)
      group.map { |row| row["step_code_id"] }.uniq.length
    end

    def stage_headline_figures(stage)
      group = rows.select { |row| row["stage"] == stage }
      section = I18n.t("reports.stages.#{stage}")
      overrides = { stage: section.downcase }
      [
        staged_figure(
          stage,
          "total_completions",
          group.length,
          section,
          overrides
        ),
        staged_figure(
          stage,
          "pass_count",
          group.count { |row| row["outcome"] == "pass" },
          section,
          overrides
        ),
        staged_figure(
          stage,
          "fail_count",
          group.count { |row| row["outcome"] == "fail" },
          section,
          overrides
        ),
        staged_figure(
          stage,
          "incomplete_count",
          group.count { |row| row["outcome"] == "incomplete" },
          section,
          overrides
        )
      ]
    end

    def staged_figure(stage, key, value, section, overrides)
      figure(key, value, help_overrides: overrides, section: section).merge(
        key: "#{stage}_#{key}"
      )
    end

    def enabled_jurisdiction_ids
      JurisdictionStepRequirement.distinct.pluck(:jurisdiction_id)
    end

    def i18n_base
      "reports.#{self.class.key}"
    end

    def column(key, i18n_key = nil)
      { key: key, label: I18n.t(i18n_key || "#{i18n_base}.columns.#{key}") }
    end
  end
end
