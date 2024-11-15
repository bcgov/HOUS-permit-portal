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
    super {}
  end

  def teui
    super {}
  end

  def tedi
    super {}
  end

  def ghgi
    super {}
  end
end
