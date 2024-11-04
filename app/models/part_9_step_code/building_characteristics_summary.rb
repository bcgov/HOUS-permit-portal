class Part9StepCode::BuildingCharacteristicsSummary < ApplicationRecord
  self.table_name = "step_code_building_characteristics_summaries"

  belongs_to :checklist, class_name: "Part9StepCode::Checklist"

  serialize :above_grade_walls_lines,
            coder: StepCode::BuildingCharacteristics::Line::AboveGradeWalls
  serialize :airtightness,
            coder: StepCode::BuildingCharacteristics::Airtightness
  serialize :below_grade_walls_lines,
            coder: StepCode::BuildingCharacteristics::Line::BelowGradeWalls
  serialize :doors_lines, coder: StepCode::BuildingCharacteristics::Line::Doors
  serialize :fossil_fuels, coder: StepCode::BuildingCharacteristics::FossilFuels
  serialize :framings_lines,
            coder: StepCode::BuildingCharacteristics::Line::Framings
  serialize :hot_water_lines,
            coder: StepCode::BuildingCharacteristics::Line::HotWater
  serialize :other_lines, coder: StepCode::BuildingCharacteristics::Line::Other
  serialize :roof_ceilings_lines,
            coder: StepCode::BuildingCharacteristics::Line::RoofCeilings
  serialize :slabs_lines, coder: StepCode::BuildingCharacteristics::Line::Slabs
  serialize :space_heating_cooling_lines,
            coder: StepCode::BuildingCharacteristics::Line::SpaceHeatingCooling
  serialize :unheated_floors_lines,
            coder: StepCode::BuildingCharacteristics::Line::UnheatedFloors
  serialize :ventilation_lines,
            coder: StepCode::BuildingCharacteristics::Line::Ventilation
  serialize :windows_glazed_doors,
            coder: StepCode::BuildingCharacteristics::WindowsGlazedDoors

  validates_with StepCode::BuildingCharacteristics::Validator
end
