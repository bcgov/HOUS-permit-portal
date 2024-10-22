class StepCode::Compliance::GenerateReports
  attr_accessor :reports
  attr_reader :checklist, :requirements

  def initialize(checklist:, requirements:)
    @checklist = checklist
    @requirements = requirements
    @reports = []
  end

  def call
    requirements.each do |requirement|
      energy_result =
        StepCode::Compliance::ProposeStep::Energy.new(
          checklist:,
          min_required_step: requirement.energy_step_required
        ).call
      zero_carbon_result =
        StepCode::Compliance::ProposeStep::ZeroCarbon.new(
          checklist:,
          min_required_step: requirement.zero_carbon_step_required
        ).call

      @reports << {
        zero_carbon: zero_carbon_result,
        energy: energy_result,
        requirement_id: requirement.id
      }
    end

    return self
  end
end
