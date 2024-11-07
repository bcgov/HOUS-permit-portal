class StepCode::Part3::V1::GenerateReports < StepCode::Part3::V0::GenerateReports
  #Before generate reports:
  #generate_requirements -> takes in initial inputs to populate form

  #Calls -> check_requirements modules to determine the values

  #this creates the generate step code summary sheet

  #Step code summary - always there
  #for Mixed use it's pass or fail

  attr_reader :checklist,
              :requirements,
              :whole_building_performance,
              :reports,
              :occupancies
  def initialize(checklist)
    @checklist = checklist
    @requirements = StepCode::Part3::V0::LookupRequirements.new(checklist).call
    @occupancies = checklist.occupancy_classifications
    @whole_building_performance =
      StepCode::Part3::V1::EvaluatePerformance.new(
        checklist: checklist,
        requirements: requirements
      ).call
  end

  def call
    return(
      {
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
    )
  end
end
