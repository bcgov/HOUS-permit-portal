class StepCode::Part3::V0::Requirements::WholeBuilding
  attr_reader :checklist, :baseline_requirement, :step_code_requirement

  def initialize(checklist:, baseline_requirement:, step_code_requirement:)
    @checklist = checklist
    @baseline_requirement = baseline_requirement
    @step_code_requirement = step_code_requirement
  end

  def call
    if checklist.occupancy_classifications.step_code_occupancy.empty?
      { total_energy: baseline_portion(:total_energy) }
    else
      { teui: total(:teui), tedi: total(:tedi), ghgi: total(:ghgi) }
    end
  end

  private

  def total(metric)
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
end
