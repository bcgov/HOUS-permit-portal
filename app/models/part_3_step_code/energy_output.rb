class Part3StepCode::EnergyOutput < ApplicationRecord
  belongs_to :checklist
  belongs_to :fuel_type

  enum source: %i[modelled reference]
end
