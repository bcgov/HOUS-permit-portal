class Part3StepCode::FuelType < ApplicationRecord
  self.table_name = "fuel_types"

  belongs_to :checklist
end
