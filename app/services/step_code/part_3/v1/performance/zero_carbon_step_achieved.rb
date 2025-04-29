class StepCode::Part3::V1::Performance::ZeroCarbonStepAchieved < StepCode::Compliance::ProposeStep::Base
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
    @min_step ||= ENV["PART_3_MIN_ZERO_CARBON_STEP"].to_i
  end

  def max_step
    @max_step ||= ENV["PART_3_MAX_ZERO_CARBON_STEP"].to_i
  end

  def checkers
    %i[ghgi_checker]
  end

  def ghgi_checker
    OpenStruct.new(
      requirements_met?:
        performance_results[:ghgi] <= requirements.dig(:whole_building, :ghgi)
    )
  end
end
