class StepCodeExportService
  def summary_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.step_code_summary_csv_headers").split(",")
      jurisdictions = Jurisdiction.all
      permit_types = PermitType.all

      jurisdictions.each do |j|
        permit_types.each do |pt|
          jurisdiction_name = j.qualified_name
          permit_type = pt.name
          permit_type_required_steps =
            j.permit_type_required_steps_by_classification(pt)
          permit_type_required_steps.each do |jtsc|
            energy_step_required = jtsc.energy_step_required
            zero_carbon_step_required = jtsc.zero_carbon_step_required
            enabled =
              energy_step_required.present? ||
                zero_carbon_step_required.present?
            csv << [
              jurisdiction_name,
              permit_type,
              enabled,
              energy_step_required,
              zero_carbon_step_required
            ]
          end
        end
      end
    end
  end

  def part_3_metrics_json(timeframe_from: nil, timeframe_to: nil)
    query =
      Part3StepCode.includes(:permit_application, :checklist).where(
        permit_applications: {
          status: %i[newly_submitted resubmitted]
        }
      )

    if timeframe_from.present?
      query = query.where("step_codes.created_at >= ?", timeframe_from)
    end

    if timeframe_to.present?
      query = query.where("step_codes.created_at <= ?", timeframe_to)
    end

    step_codes = query.to_a

    {
      metadata: {
        type: "Part3StepCode",
        timeframe_from: timeframe_from,
        timeframe_to: timeframe_to,
        total_records: step_codes.length,
        generated_at: Time.current.iso8601
      },
      data:
        step_codes
          .map do |step_code|
            checklist = step_code.checklist
            next unless checklist

            StepCodeChecklistBlueprint.render_as_hash(
              checklist,
              view: :metrics_export
            )
          end
          .compact
    }
  end

  def part_9_metrics_json(timeframe_from: nil, timeframe_to: nil)
    query =
      Part9StepCode.includes(:permit_application, :checklists).where(
        permit_applications: {
          status: %i[newly_submitted resubmitted]
        }
      )

    if timeframe_from.present?
      query = query.where("step_codes.created_at >= ?", timeframe_from)
    end

    if timeframe_to.present?
      query = query.where("step_codes.created_at <= ?", timeframe_to)
    end

    step_codes = query.to_a

    {
      metadata: {
        type: "Part9StepCode",
        timeframe_from: timeframe_from,
        timeframe_to: timeframe_to,
        total_records: step_codes.length,
        generated_at: Time.current.iso8601
      },
      data:
        step_codes
          .map do |step_code|
            checklist = step_code.primary_checklist
            next unless checklist

            StepCodeChecklistBlueprint.render_as_hash(
              checklist,
              view: :metrics_export
            )
          end
          .compact
    }
  end
end
