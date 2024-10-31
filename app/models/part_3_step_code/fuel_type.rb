module Part3StepCode
  class FuelType < ApplicationRecord
    belongs_to :checklist
  end
end
