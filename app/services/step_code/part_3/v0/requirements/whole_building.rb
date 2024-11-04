class StepCode::Part3::V0::Requirements::WholeBuilding
  attr_reader :checklist, :baseline_requirement, :step_code_requirement

  def initialize(checklist:, baseline_requirement:, step_code_requirement:)
    @checklist = checklist
    @baseline_requirement = baseline_requirement
    @step_code_requirement = step_code_requirement
  end

  def call
    {
      total_energy: total(metric: :total_energy),
      teui: total(metric: :teui),
      tedi: total(metric: :tedi),
      ghgi: total(metric: :ghgi)
    }
  end

  private

  def total(metric:)
    return unless applicable?(metric: metric)

    baseline_portion(metric) + step_code_portion(metric)
  end

  def baseline_portion(metric)
    baseline_mfa * baseline_requirement[metric]
  end

  def step_code_portion(metric)
    step_code_mfa * step_code_requirement[metric]
  end

  def baseline_mfa
    @baseline_mfa ||= baseline_requirement[:modelled_floor_area]
  end

  def step_code_mfa
    @step_code_mfa ||= step_code_requirement[:modelled_floor_area]
  end

  # buildings with NO step code occupancies report total energy
  # if there are ANY step code occupancies, teui/tedi/ghgi is reported
  def applicable?(metric)
    return step_code_requirement.blank? if metric == :total_energy

    step_code_requirement.present?
  end
end
