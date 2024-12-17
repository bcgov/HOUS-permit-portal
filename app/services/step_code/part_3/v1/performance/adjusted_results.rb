class StepCode::Part3::V1::Performance::AdjustedResults < StepCode::Part3::V1::Performance::Base
  attr_reader :results_as_modelled,
              :corridor_pressurization_adjustment,
              :suite_sub_metering_adjustment

  def initialize(
    checklist:,
    results_as_modelled:,
    corridor_pressurization_adjustment:,
    suite_sub_metering_adjustment:
  )
    super(checklist: checklist)
    @results_as_modelled = results_as_modelled
    @corridor_pressurization_adjustment = corridor_pressurization_adjustment
    @suite_sub_metering_adjustment = suite_sub_metering_adjustment
  end

  private

  def total_energy
    super do
      return if results_as_modelled[:total_energy] == 0

      results_as_modelled[:total_energy] -
        corridor_pressurization_adjustment[:total_energy] +
        suite_sub_metering_adjustment[:total_energy]
    end
  rescue StandardError
    nil
  end

  def teui
    super do
      return if results_as_modelled[:teui] == 0

      results_as_modelled[:teui] - corridor_pressurization_adjustment[:teui] +
        suite_sub_metering_adjustment[:teui]
    end
  rescue StandardError
    nil
  end

  def tedi
    super do
      {
        whole_building: tedi_for(:whole_building),
        step_code_portion: tedi_for(:step_code_portion)
      }
    end
  rescue StandardError
    nil
  end

  def tedi_for(portion)
    return if results_as_modelled.dig(:tedi, portion) == 0

    results_as_modelled.dig(:tedi, portion) -
      corridor_pressurization_adjustment.dig(:tedi, portion)
  end

  def ghgi
    super do
      return if results_as_modelled[:ghgi] == 0

      results_as_modelled[:ghgi] - corridor_pressurization_adjustment[:ghgi]
    end
  rescue StandardError
    nil
  end
end
