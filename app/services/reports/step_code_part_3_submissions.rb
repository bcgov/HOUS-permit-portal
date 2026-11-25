module Reports
  class StepCodePart3Submissions < StepCodePart3
    include StepCodeSubmissions

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
  end
end
