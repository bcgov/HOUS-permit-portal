module Part3StepCode
  class MakeUpAirFuel < ApplicationRecord
    belongs_to :checklist
    belongs_to :fuel_type
  end
end
