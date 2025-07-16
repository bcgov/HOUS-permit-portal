module StepCodeParamsConcern
  extend ActiveSupport::Concern

  private

  def step_code_params
    # This method permits attributes relevant to both Part3 and Part9 StepCodes.
    # Models should only pick up the attributes relevant to them during mass assignment.
    params.require(:step_code).permit(
      :type, # Added type discriminator
      :name, # For Part9StepCode
      :permit_application_id, # Generally set directly in controller, but can be permitted
      :project_id, # Generally set directly in controller, but can be permitted. DEPRECATED, use permit_project_id
      :permit_project_id, # Added to allow associating with an existing project
      # Part 3 specific (or potentially shared if checklist_attributes becomes generic)
      checklist_attributes: [section_completion_status: {}],
      # Part 9 specific
      pre_construction_checklist_attributes: [
        :compliance_path,
        data_entries_attributes: [
          :district_energy_ef,
          :district_energy_consumption,
          :other_ghg_ef,
          :other_ghg_consumption,
          h2k_file: {
          }
        ]
      ],
      # Nested attributes for PermitProject
      permit_project_attributes: [
        :id, # Allow :id for updates if project already exists and is being associated
        :title, # Added title
        :full_address,
        :pid,
        :pin,
        :owner_id,
        :property_plan_jurisdiction_id
        # Add any other PermitProject attributes the frontend might send
      ]
    )
  end
end
