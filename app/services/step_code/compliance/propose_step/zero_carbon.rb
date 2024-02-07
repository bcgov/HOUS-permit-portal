class StepCode::Compliance::ProposeStep::ZeroCarbon < StepCode::Compliance::ProposeStep::Base
  def checkers
    %i[ghg, co2, prescriptive]
  end

  def ghg
    @ghg ||= StepCode::Compliance::CheckRequirements::ZeroCarbon::GHG.new(step:, checklist:).call
  end

  def co2
    @co2 ||= StepCode::Compliance::CheckRequirements::ZeroCarbon::CO2.new(step:, checklist:).call
  end

  def prescriptive
    @prescriptive ||= StepCode::Compliance::CheckRequirements::ZeroCarbon::Prescriptive.new(step:, checklist:).call
  end
end
