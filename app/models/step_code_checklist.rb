class StepCodeChecklist < ApplicationRecord
  belongs_to :step_code

  delegate :data_entries, to: :step_code

  enum stage: %i[pre_construction mid_construction as_built]

  def energy_step
    StepCode::Compliance::ProposeStep::Energy.new(self).call.step
  end

  def zero_carbon_step
    StepCode::Compliance::ProposeStep::ZeroCarbon.new(self).call.step
  end
end
