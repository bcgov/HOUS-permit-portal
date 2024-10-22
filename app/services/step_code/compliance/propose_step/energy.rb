class StepCode::Compliance::ProposeStep::Energy < StepCode::Compliance::ProposeStep::Base
  def min_step
    @min_step ||= ENV["MIN_ENERGY_STEP"].to_i
  end

  def max_step
    @max_step ||= ENV["MAX_ENERGY_STEP"].to_i
  end

  def checkers
    %i[meui_checker tedi_checker airtightness_checker]
  end

  def meui_checker
    StepCode::Compliance::CheckRequirements::Energy::MEUI.new(
      step: step || min_required_step,
      checklist:
    )
  end

  def tedi_checker
    StepCode::Compliance::CheckRequirements::Energy::TEDI.new(
      step: step || min_required_step,
      checklist:
    )
  end

  def airtightness_checker
    StepCode::Compliance::CheckRequirements::Energy::Airtightness.new(
      step: step || min_required_step,
      checklist:
    )
  end
end
