class StepCode::Part3::V1::GenerateReport < StepCode::Part3::V0::GenerateReport
  attr_reader :checklist, :requirements, :performance, :reports
  attr_accessor :results

  def initialize(checklist:)
    @checklist = checklist
    @requirements =
      StepCode::Part3::V0::LookupRequirements.new(checklist: checklist).call
    # binding.pry
    @performance =
      StepCode::Part3::V1::EvaluatePerformance.new(
        checklist: checklist,
        requirements: requirements
      ).call
  end

  def call
    self.results = { occupancies: occupancies, performance: performance }
    self
  end

  def occupancies
    @occupancies ||=
      checklist.occupancy_classifications.map do |oc|
        {
          occupancy: oc.key,
          energy_requirement: oc.energy_step_required,
          zero_carbon_requirement: oc.zero_carbon_step_required,
          performance_requirement: oc.performance_requirement
        }
      end
  end
end
