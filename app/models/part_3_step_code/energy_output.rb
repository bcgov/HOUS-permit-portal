class Part3StepCode::EnergyOutput < ApplicationRecord
  self.table_name = "energy_outputs"

  belongs_to :checklist
  belongs_to :fuel_type

  enum source: %i[modelled reference]
end
