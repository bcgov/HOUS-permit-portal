class StepCodeDataEntry < ApplicationRecord
  belongs_to :step_code

  enum stage: %i[proposed as_built]
end
