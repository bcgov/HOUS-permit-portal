class StepCode::Part3::V1::GenerateReports < StepCode::Part3::V0::GenerateReports
  attr_reader :checklist,
              :requirements,
              :whole_building_performance,
              :reports,
              :occupancies
  attr_accessor :results

  def initialize(checklist:)
    @checklist = checklist
    @requirements =
      StepCode::Part3::V0::LookupRequirements.new(checklist: checklist).call
    @occupancies = checklist.occupancy_classifications
    @whole_building_performance =
      StepCode::Part3::V1::EvaluatePerformance.new(
        checklist: checklist,
        requirements: requirements[:whole_building_requirements]
      ).call
  end

  def call
    self.results = {
      occupancies:
        @occupancies.map do |oc|
          {
            occupancy: oc.key,
            energy_requirement: oc.energy_step_required,
            zero_carbon_requirement: oc.zero_carbon_step_required,
            performance_requirement: oc.performance_requirement
          }
        end,
      whole_building_performance: whole_building_performance,
      step_code_summary: {
        step_achieved: nil,
        zero_carbon_achieved: nil
      }
    }

    self
  end
end
