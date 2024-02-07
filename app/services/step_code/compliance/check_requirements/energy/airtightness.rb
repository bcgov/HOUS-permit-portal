# ACH - Air Changes per Hour @ 50Pa
# NLA - Normalized Leakage Area (cm2/m2) @ 10Pa
# NLR - Normalized Leakage Rate (L/s/m^2) @ 50Pa

class StepCode::Compliance::CheckRequirements::Energy::Airtightness < StepCode::Compliance::CheckRequirements::Energy::Base
  def requirements_met?
    total(:ach) <= ach_requirement || total(:nla) <= nla_requirement || nlr <= nlr_requirement
  end

  private

  def ach_requirement
    tedi_reference.ach
  end

  def nla_requirement
    tedi_reference.nla
  end

  def nlr
    return 0 if total_heated_floor_area <= 0
    total(:building_volume) * total(:ach) * 1000 / 3600 / total(:building_envelope_surface_area)
  end

  def nlr_requirement
    tedi_reference.nlr
  end
end
