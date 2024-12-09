class Part3StepCode::EnergyOutput < ApplicationRecord
  self.table_name = "energy_outputs"

  belongs_to :checklist
  belongs_to :fuel_type

  # We only require the name if the use type is other as it's user defined
  validates :name, presence: true, if: -> { use_type == "other" }

  enum source: %i[modelled reference]
  enum use_type: {
         interior_lighting: 0,
         exterior_lighting: 1,
         heating_general: 2,
         cooling: 3,
         pumps: 4,
         fans: 5,
         domestic_hot_water: 6,
         plug_loads: 7,
         heating_gas: 8,
         other: 9
       }
end
