class StepCode::Part3::V0::Compliance::GenerateReports
  attr_accessor :reports
  attr_reader :checklist, :requirements

  def initialize(checklist)
    @checklist = checklist
    @requirements = [] # requirements
    @reports = {}
    @occupancies = checklist.occupancy_classifications
    @whole_building_performance = {}
  end

  def call
    @reports = {
      occupancies:
        @occupancies.map do |oc|
          {
            occupancy: oc.name,
            energy_requirement: oc.energy_step_required,
            zero_carbon_requirement: oc.zero_carbon_step_required,
            performance_requirement: oc.performance_requirement
          }
        end,
      whole_building_performance: {
        does_building_comply: {
          teiu: false,
          tedi: false,
          ghgi: false
        }
      },
      step_code_summary: {
        step_achieved: nil,
        zero_carbon_achieved: nil
      }
    }

    return reports
  end
end
