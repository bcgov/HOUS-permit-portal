module Reports
  class StepCodePart3 < StepCodePart9
    CSV_HEADERS = [
      "Application number",
      "Jurisdiction",
      "Submission date",
      "Address",
      "Compliance outcome",
      "Energy step achieved",
      "Zero carbon step achieved"
    ].freeze

    def csv_from_payload(_payload)
      submitted_at_by_application = first_submitted_at
      CSV.generate do |csv|
        csv << CSV_HEADERS
        step_code_class
          .where(id: submitted_scope.select("step_codes.id"))
          .includes(
            :jurisdiction,
            checklist_includes,
            permit_application: {
              permit_project: :jurisdiction
            }
          )
          .find_each do |step_code|
            submitted_at =
              submitted_at_by_application[step_code.permit_application_id]
            next unless submitted_at

            outcome, energy_step, zero_carbon_step =
              classify(step_code.current_checklist)
            csv << [
              step_code.permit_application_number,
              step_code.jurisdiction&.name ||
                I18n.t("#{i18n_base}.unknown_jurisdiction"),
              submitted_at.to_date.iso8601,
              step_code.full_address,
              outcome,
              energy_step,
              zero_carbon_step
            ]
          end
      end
    end

    def step_code_class
      Part3StepCode
    end

    def checklist_includes
      { checklists: :occupancy_classifications }
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
