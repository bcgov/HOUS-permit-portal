class StepCode::Part3::ChecklistBlueprint < Blueprinter::Base
  identifier :id

  fields :section_completion_status,
         :total_annual_thermal_energy_demand,
         :total_annual_cooling_energy_demand,
         :step_code_annual_thermal_energy_demand,
         :total_occupancy_floor_area,
         :total_step_code_occupancy_floor_area,
         :jurisdiction_name,
         :building_height,
         :heating_degree_days,
         :ref_annual_thermal_energy_demand,
         :generated_electricity,
         :overheating_hours,
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
         :completed_by_phone_number,
         :completed_by_organization_name
  field :pid, name: :project_identifier
  field :nickname, name: :project_name
  field :full_address, name: :project_address

  field :overheating_hours_limit do |_checklist, _options|
    Constants::Part3StepCode::OVERHEATING_HOURS_LIMIT
  end

  field :permit_date do |checklist, _options|
    checklist.newly_submitted_at&.strftime("%b%e, %Y")
  end

  field :status, name: :project_stage

  field :building_code_version do |checklist, _options|
    if checklist.newly_submitted_at.present?
      Constants::Part3StepCode::BUILDING_CODE_VERSION_LOOKUP
        .find { |_, date| checklist.newly_submitted_at <= date }
        &.first
    else
      Constants::Part3StepCode::BUILDING_CODE_VERSION_LOOKUP
        .max_by { |_, date| date }
        &.first
    end
  end

  field :climate_zone do |checklist, _options|
    checklist.heating_degree_days &&
      StepCode::Part3::V0::Requirements::References::ClimateZone.value(
        checklist.heating_degree_days
      )
  end

  association :baseline_occupancies,
              blueprint: StepCode::Part3::BaselineOccupancyBlueprint
  association :step_code_occupancies,
              blueprint: StepCode::Part3::StepCodeOccupancyBlueprint
  association :fuel_types,
              blueprint:
                StepCode::Part3::FuelTypeBlueprint do |checklist, _options|
    checklist.fuel_types + Part3StepCode::FuelType.defaults
  end
  association :reference_energy_outputs,
              blueprint: StepCode::Part3::EnergyOutputBlueprint
  association :modelled_energy_outputs,
              blueprint: StepCode::Part3::EnergyOutputBlueprint
  association :make_up_air_fuels,
              blueprint: StepCode::Part3::MakeUpAirFuelBlueprint
  association :document_references,
              blueprint: StepCode::Part3::DocumentReferenceBlueprint

  field :compliance_report do |checklist, _options|
    StepCode::Part3::ComplianceReportBlueprint.render_as_hash(
      checklist.compliance_report.results
    )
  end

  view :metrics_export do
    exclude :completed_by_name
    exclude :completed_by_title
    exclude :completed_by_email
    exclude :completed_by_phone_number
    exclude :completed_by_organization_name

    association :document_references,
                blueprint: StepCode::Part3::DocumentReferenceBlueprint,
                view: :metrics_export
  end

  view :extended do
    include_view :default
  end
end
