class Part3StepCode::MakeUpAirFuel < ApplicationRecord
  belongs_to :checklist
  belongs_to :fuel_type
end
