# ACH - Air Changes per Hour @ 50Pa
# NLA - Normalized Leakage Area (cm2/m2) @ 10Pa
# NLR - Normalized Leakage Rate (L/s/m^2) @ 50Pa

class StepCode::Compliance::CheckRequirements::Energy::Airtightness < StepCode::Compliance::CheckRequirements::Energy::Base
  def requirements_met?
    ach <= ach_requirement || nla <= nla_requirement || nlr <= nlr_requirement
  end

  def ach
    @ach ||= total(:ach)
  end

  def ach_requirement
    @ach_requirement ||= tedi_reference.ach
  end

  def nla
    @nla ||= total(:nla)
  end

  def nla_requirement
    @nla_requirement ||= tedi_reference.nla
  end

  def nlr
    return @nlr if @nlr
    return 0 if total_heated_floor_area <= 0
    @nlr = volume * total(:ach) * 1000 / 3600 / surface_area
  end

  def surface_area
    @surface_area ||= total(:building_envelope_surface_area)
  end

  def volume
    @volume ||= total(:building_volume)
  end

  def nlr_requirement
    @nlr_requiremnt ||= tedi_reference.nlr
  end
end
