class StepCode::Part3::V0::Compliance::GenerateReports
  attr_accessor :reports
  attr_reader :checklist, :requirements

  def initialize(data)
    @checklist = [] #checklist
    @requirements = [] # requirements
    @reports = {}
    @occupancies = data[:occupancies]
    @whole_building_performance = {}
  end

  def call
    @reports = {
      occupancies:
        @occupancies.map do |hash|
          hash.slice(:occupancy, :energy_requirement, :zero_carbon_requirement)
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
