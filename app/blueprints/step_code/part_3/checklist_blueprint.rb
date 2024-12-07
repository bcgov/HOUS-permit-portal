class StepCode::Part3::ChecklistBlueprint < Blueprinter::Base
  identifier :id

  fields :section_completion_status

  fields :jurisdiction_name, :building_height, :heating_degree_days
  field :pid, name: :project_identifier
  field :nickname, name: :project_name
  field :full_address, name: :project_address

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
  association :fuel_types, blueprint: StepCode::Part3::FuelTypeBlueprint
end
