class StepCode::Part3::V1::Performance::EnergyStepAchieved < StepCode::Compliance::ProposeStep::Base
  attr_reader :min_required_step, :performance_results, :requirements

  def initialize(
    checklist:,
    min_required_step:,
    performance_results:,
    requirements:
  )
    super(checklist:, min_required_step:)
    @performance_results = performance_results
    @requirements = requirements
  end

  def min_step
    @min_step ||= ENV["PART_3_MIN_ENERGY_STEP"].to_i
  end

  def max_step
    @max_step ||= ENV["PART_3_MAX_ENERGY_STEP"].to_i
  end

  def checkers
    %i[tedi_checker step_code_tedi_checker teui_checker]
  end

  def tedi_checker
    OpenStruct.new(
      requirements_met?:
        performance_results.dig(:tedi, :whole_building) <=
          requirements.dig(:whole_building, :tedi)
    )
  end

  def step_code_tedi_checker
    OpenStruct.new(
      requirements_met?:
        performance_results.dig(:tedi, :step_code_portion) <=
          requirements.dig(:step_code_portions, :area_weighted_totals, :tedi)
    )
  end

  def teui_checker
    OpenStruct.new(
      requirements_met?:
        performance_results[:teui] <= requirements.dig(:whole_building, :teui)
    )
  end
end
