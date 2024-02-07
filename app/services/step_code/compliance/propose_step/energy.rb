class StepCode::Compliance::ProposeStep::Energy < StepCode::Compliance::ProposeStep::Base
  def checkers
    %i[meui tedi airtightness]
  end

  def meui
    StepCode::Compliance::CheckRequirements::Energy::MEUI.new(step: step, checklist: checklist)
  end

  def tedi
    StepCode::Compliance::CheckRequirements::Energy::TEDI.new(step: step, checklist: checklist)
  end

  def airtightness
    StepCode::Compliance::CheckRequirements::Energy::Airtightness.new(step: step, checklist: checklist)
  end
end
