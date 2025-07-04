class StepCode::Part3::V1::Performance::OverallCompliance < StepCode::Part3::V1::Performance::Base
  attr_reader :requirements, :adjusted_results

  def initialize(checklist:, requirements:, adjusted_results:)
    super(checklist: checklist)
    @requirements = requirements
    @adjusted_results = adjusted_results
  end

  def call
    super do
      self.results = {
        **results,
        energy_step_achieved:,
        zero_carbon_step_achieved:,
        performance_requirement_achieved:
      }
    end
  end

  private

  def total_energy
    super do
      adjusted_results[:total_energy] <=
        requirements.dig(:whole_building, :total_energy)
    end
  rescue StandardError
    nil
  end

  def teui
    super do
      adjusted_results[:teui] <= requirements.dig(:whole_building, :teui)
    end
  rescue StandardError
    nil
  end

  def tedi
    super do
      # binding.pry
      {
        whole_building:
          whole_building_tedi_compliance? && step_code_portion_tedi_compliance?,
        step_code_portion: step_code_portion_tedi_compliance?
      }
    end
  rescue StandardError
    nil
  end

  def energy_step_achieved
    return unless step_code_occupancy.present?

    StepCode::Part3::V1::Performance::EnergyStepAchieved
      .new(
        checklist: checklist,
        min_required_step: step_code_occupancy.energy_step_required,
        performance_results: adjusted_results,
        requirements: requirements
      )
      .call
      .step
  rescue StandardError
    nil
  end

  def zero_carbon_step_achieved
    return unless step_code_occupancy.present?

    StepCode::Part3::V1::Performance::ZeroCarbonStepAchieved
      .new(
        checklist: checklist,
        min_required_step: step_code_occupancy.zero_carbon_step_required,
        performance_results: adjusted_results,
        requirements: requirements
      )
      .call
      .step
  rescue StandardError
    nil
  end

  def performance_requirement_achieved
    return unless step_code_occupancies.empty? && baseline_occupancies.present?

    total_energy ? baseline_occupancies.first.performance_requirement : nil
  end

  def step_code_occupancy
    @step_code_occupancy ||=
      step_code_occupancies.length == 1 && step_code_occupancies.first
  end

  def step_code_occupancies
    @step_code_occupancies ||=
      checklist.occupancy_classifications.step_code_occupancy
  end

  def baseline_occupancies
    @baseline_occupancies ||=
      checklist.occupancy_classifications.baseline_occupancy
  end

  def whole_building_tedi_compliance?
    @whole_building_tedi_compliance ||=
      adjusted_results.dig(:tedi, :whole_building) <=
        requirements.dig(:whole_building, :tedi)
  end

  def step_code_portion_tedi_compliance?
    @step_code_portion_tedi_compliance ||=
      adjusted_results.dig(:tedi, :step_code_portion) <=
        requirements.dig(:step_code_portions, :area_weighted_totals, :tedi)
  end

  def ghgi
    super do
      adjusted_results[:ghgi] <= requirements.dig(:whole_building, :ghgi)
    end
  rescue StandardError
    nil
  end
end
