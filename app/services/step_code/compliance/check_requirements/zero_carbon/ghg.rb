# GHG: Greenhouse Gas

class StepCode::Compliance::CheckRequirements::ZeroCarbon::GHG < StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  def requirements_met?
    return false unless total_ghg != 0
    total_ghg <= total_ghg_requirement
  end

  private

  def total_ghg_requirement
    ZERO_CARBON_REFERENCES.dig(step, :total_carbon)
  end
end
