# GHG: Greenhouse Gas

class StepCode::Compliance::CheckRequirements::ZeroCarbon::GHG < StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  def requirements_met?
    return false unless total_ghg != 0
    return true unless total_ghg_requirement
    total_ghg <= total_ghg_requirement
  end

  def total_ghg_requirement
    @total_ghg_requirement ||=
      StepCode::Part9::References::ZERO_CARBON_REFERENCES.dig(
        step,
        :total_carbon
      )
  end
end
