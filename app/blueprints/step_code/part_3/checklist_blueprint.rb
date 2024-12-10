class StepCode::Part3::ChecklistBlueprint < Blueprinter::Base
  identifier :id

  fields :section_completion_status,
         :total_annual_thermal_energy_demand,
         :total_annual_cooling_energy_demand,
         :step_code_annual_thermal_energy_demand

  fields :jurisdiction_name,
         :building_height,
         :heating_degree_days,
         :ref_annual_thermal_energy_demand,
         :generated_electricity,
         :overheating_hours
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
  association :modelled_energy_outputs,
              blueprint: StepCode::Part3::EnergyOutputBlueprint
end
