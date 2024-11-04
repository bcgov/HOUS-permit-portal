class StepCode::Part3::V0::LookupRequirements
  attr_reader :checklist

  def initialize(checklist:)
    @checklist = checklist
  end

  def call
    {
      baseline_requirement: baseline_requirement,
      step_code_requirements: step_code_requirements,
      whole_building_requirements: whole_building_requirements
    }
  end

  private

  def baseline_requirement
    StepCode::Part3::V0::Requirements::Baseline.new(checklist: checklist).call
  end

  def step_code_requirements
    StepCode::Part3::V0::Requirements::StepCode.new(checklist: checklist).call
  end

  def whole_building_requirements
    StepCode::Part3::V0::Requirements::WholeBuilding.new(
      checklist: checklist,
      baseline_requirement: baseline_requirement,
      step_code_requirement: step_code_requirements
    ).call
  end
end
