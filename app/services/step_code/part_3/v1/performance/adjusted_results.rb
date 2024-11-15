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

      (
        results_as_modelled[:total_energy] -
          corridor_pressurization_adjustment[:total_energy] +
          suite_sub_metering_adjustment[:total_energy]
      ).round(0)
    end
  end

  def teui
    super do
      return if results_as_modelled[:teui] == 0

      (
        results_as_modelled[:teui] - corridor_pressurization_adjustment[:teui] +
          suite_sub_metering_adjustment[:teui]
      ).round(0)
    end
  end

  def tedi
    super do
      return if results_as_modelled[:tedi] == 0

      (
        results_as_modelled[:tedi] - corridor_pressurization_adjustment[:tedi]
      ).round(0)
    end
  end

  def ghgi
    super do
      return if results_as_modelled[:ghgi] == 0

      (
        results_as_modelled[:ghgi] - corridor_pressurization_adjustment[:ghgi]
      ).round(0)
    end
  end
end
