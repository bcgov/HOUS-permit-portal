module Reports
  class StepCodePart3 < StepCodePart9
    CSV_HEADERS = [
      "Application number",
      "Jurisdiction",
      "Completed at",
      "Stage",
      "Address",
      "Compliance outcome",
      "Energy step achieved",
      "Zero carbon step achieved"
    ].freeze

    def csv_from_payload(_payload)
      CSV.generate do |csv|
        csv << CSV_HEADERS
        completed_scope
          .includes(checklist_row_includes)
          .find_each do |checklist|
            step_code = checklist.step_code
            outcome, energy_step, zero_carbon_step = classify(checklist)
            csv << [
              step_code.permit_application_number,
              step_code.jurisdiction&.name ||
                I18n.t("#{i18n_base}.unknown_jurisdiction"),
              checklist.stage_completed_at&.to_date&.iso8601,
              checklist.stage,
              step_code.full_address,
              outcome,
              energy_step,
              zero_carbon_step
            ]
          end
      end
    end

    def checklist_class
      Part3StepCode::Checklist
    end

    def checklist_row_includes
      [
        :occupancy_classifications,
        {
          step_code: [
            :jurisdiction,
            { permit_application: { permit_project: :jurisdiction } }
          ]
        }
      ]
    end

    def enabled_jurisdiction_ids
      Part3OccupancyRequiredStep.distinct.pluck(:jurisdiction_id)
    end

    def classify(checklist)
      return "incomplete", nil, nil if checklist.nil?
      return "incomplete", nil, nil if checklist.occupancy_classifications.none?

      summary =
        checklist.compliance_report.results.dig(
          :performance,
          :compliance_summary
        ) || {}
      energy = summary[:energy_step_achieved]
      zero_carbon = summary[:zero_carbon_step_achieved]
      if checklist.step_code_occupancies.any?
        return "incomplete", nil, nil if energy.nil? && zero_carbon.nil?

        outcome = energy && zero_carbon ? "pass" : "fail"
        [outcome, energy, zero_carbon]
      else
        outcome =
          summary[:performance_requirement_achieved].present? ? "pass" : "fail"
        [outcome, nil, nil]
      end
    rescue StandardError
      ["incomplete", nil, nil]
    end
  end
end
