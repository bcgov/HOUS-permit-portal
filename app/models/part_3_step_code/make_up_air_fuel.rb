class Part3StepCode::MakeUpAirFuel < ApplicationRecord
  self.table_name = "make_up_air_fuels"

  belongs_to :checklist
  belongs_to :fuel_type
end
