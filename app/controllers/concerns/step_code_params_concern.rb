module StepCodeParamsConcern
  extend ActiveSupport::Concern

  private

  def step_code_params
    # This method permits attributes relevant to both Part3 and Part9 StepCodes.
    # Models should only pick up the attributes relevant to them during mass assignment.
    params.require(:step_code).permit(
      :type, # Added type discriminator
      :name, # For Part9StepCode
      :permit_application_id,
      # Part 3 specific (or potentially shared if checklist_attributes becomes generic)
      checklist_attributes: [
        {
          section_completion_status: {
            start: %i[complete relevant],
            project_details: %i[complete relevant],
            location_details: %i[complete relevant],
            baseline_occupancies: %i[complete relevant],
            baseline_details: %i[complete relevant],
            district_energy: %i[complete relevant],
            fuel_types: %i[complete relevant],
            additional_fuel_types: %i[complete relevant],
            baseline_performance: %i[complete relevant],
            step_code_occupancies: %i[complete relevant],
            step_code_performance_requirements: %i[complete relevant],
            modelled_outputs: %i[complete relevant],
            renewable_energy: %i[complete relevant],
            overheating_requirements: %i[complete relevant],
            residential_adjustments: %i[complete relevant],
            document_references: %i[complete relevant],
            performance_characteristics: %i[complete relevant],
            hvac: %i[complete relevant],
            contact: %i[complete relevant],
            requirements_summary: %i[complete relevant],
            step_code_summary: %i[complete relevant]
          }
        }
      ],
      # Part 9 specific
      pre_construction_checklist_attributes: [
        :compliance_path,
        data_entries_attributes: [
          :district_energy_ef,
          :district_energy_consumption,
          :other_ghg_ef,
          :other_ghg_consumption,
          h2k_file: [
            :id,
            :storage,
            metadata: %i[filename size mime_type content_disposition]
          ]
        ]
      ]
    )
  end

  def step_code_params_for_create
    step_code_params.merge(creator: current_user)
  end
end
