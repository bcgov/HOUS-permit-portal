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
      # Standalone-editable fields
      :full_address,
      :reference_number,
      :title,
      :permit_date,
      :phase,
      :building_code_version,
      :jurisdiction_id,
      # Part 3 specific (or potentially shared if checklist_attributes becomes generic)
      checklist_attributes: [
        { section_completion_status: section_completion_status_params }
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

  def section_completion_status_params
    {
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
  end

  def checklist_params
    params.require(:checklist).permit(
      :building_height,
      :heating_degree_days,
      :climate_zone,
      :ref_annual_thermal_energy_demand,
      :generated_electricity,
      :overheating_hours,
      :total_annual_thermal_energy_demand,
      :step_code_annual_thermal_energy_demand,
      :pressurized_doors_count,
      :pressurization_airflow_per_door,
      :pressurized_corridors_area,
      :is_suite_sub_metered,
      :suite_heating_energy,
      :heating_system_plant,
      :heating_system_type,
      :heating_system_plant_description,
      :heating_system_type_description,
      :cooling_system_plant,
      :cooling_system_type,
      :cooling_system_plant_description,
      :cooling_system_type_description,
      :dhw_system_type,
      :dhw_system_description,
      :software,
      :software_name,
      :simulation_weather_file,
      :above_ground_wall_area,
      :window_to_wall_area_ratio,
      :design_airtightness,
      :tested_airtightness,
      :modelled_infiltration_rate,
      :as_built_infiltration_rate,
      :average_wall_clear_field_r_value,
      :average_wall_effective_r_value,
      :average_roof_clear_field_r_value,
      :average_roof_effective_r_value,
      :average_window_effective_u_value,
      :average_window_solar_heat_gain_coefficient,
      :average_occupant_density,
      :average_lighting_power_density,
      :average_ventilation_rate,
      :dhw_low_flow_savings,
      :is_demand_control_ventilation_used,
      :sensible_recovery_efficiency,
      :completed_by_name,
      :completed_by_title,
      :completed_by_email,
      :completed_by_organization_name,
      :building_code_version,
      :phase,
      section_completion_status: section_completion_status_params,
      baseline_occupancies_attributes: %i[
        _destroy
        id
        key
        modelled_floor_area
        performance_requirement
        percent_better_requirement
        requirement_source
      ],
      step_code_occupancies_attributes: %i[
        _destroy
        id
        key
        modelled_floor_area
        energy_step_required
        zero_carbon_step_required
        requirement_source
      ],
      fuel_types_attributes: %i[_destroy id key description emissions_factor],
      reference_energy_outputs_attributes: %i[id fuel_type_id annual_energy],
      modelled_energy_outputs_attributes: %i[
        _destroy
        id
        fuel_type_id
        use_type
        name
        annual_energy
      ],
      make_up_air_fuels_attributes: %i[
        _destroy
        id
        fuel_type_id
        percent_of_load
      ],
      document_references_attributes: %i[
        _destroy
        id
        document_type
        document_type_description
        issued_for
        document_name
        date_issued
        prepared_by
      ]
    )
  end
end
