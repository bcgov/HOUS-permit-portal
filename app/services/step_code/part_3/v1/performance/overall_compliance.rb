class StepCode::Part3::V1::Performance::OverallCompliance < StepCode::Part3::V1::Performance::Base
  attr_reader :requirements, :adjusted_results

  def initialize(checklist:, requirements:, adjusted_results:)
    super(checklist: checklist)
    @requirements = requirements
    @adjusted_results = adjusted_results
  end

  private

  def total_energy
    super do
      adjusted_results[:total_energy] <=
        requirements.dig(:whole_building, :total_energy)
    end
  end

  def teui
    super do
      adjusted_results[:teui] <= requirements.dig(:whole_building, :teui)
    end
  end

  def tedi
    super do
      {
        whole_building:
          whole_building_tedi_compliance? && step_code_portion_tedi_compliance?,
        step_code_portion: step_code_portion_tedi_compliance?
      }
    end
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
  end
end
