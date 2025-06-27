class StepCode::Compliance::CheckRequirements::ZeroCarbon::CO2 < StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  def requirements_met?
    return false if total_ghg == 0
    return true unless co2_requirement && co2_max_requirement
    co2 <= co2_requirement && total_ghg <= co2_max_requirement
  end

  def co2
    @co2 ||= total_ghg / total_heated_floor_area
  end

  def co2_requirement
    @co2_requirement ||=
      StepCode::Part9::References::ZERO_CARBON_REFERENCES.dig(
        step,
        :carbon_per_floor_area
      )
  end

  def co2_max_requirement
    @co2_max_requirement ||=
      StepCode::Part9::References::ZERO_CARBON_REFERENCES.dig(
        step,
        :carbon_per_floor_area_max
      )
  end
end
