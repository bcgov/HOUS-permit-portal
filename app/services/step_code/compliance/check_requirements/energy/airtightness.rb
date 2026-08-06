# ACH - Air Changes per Hour @ 50Pa
# NLA - Normalized Leakage Area (cm2/m2) @ 10Pa
# NLR - Normalized Leakage Rate (L/s/m^2) @ 50Pa

class StepCode::Compliance::CheckRequirements::Energy::Airtightness < StepCode::Compliance::CheckRequirements::Energy::Base
  def requirements_met?
    ach <= ach_requirement || nla <= nla_requirement || nlr <= nlr_requirement
  end

  def ach
    @ach ||= average(:ach)
  end

  def ach_requirement
    @ach_requirement ||= tedi_reference.ach
  end

  def nla
    @nla ||= average(:nla)
  end

  def nla_requirement
    @nla_requirement ||= tedi_reference.nla
  end

  # Excel Calculator: each suite line computes NLR, Proposed total = AVERAGE of those.
  def nlr
    return @nlr if @nlr

    values =
      checklist.data_entries.filter_map do |entry|
        entry_surface = entry.building_envelope_surface_area.to_f
        entry_volume = entry.building_volume.to_f
        next if entry_surface <= 0 || entry_volume <= 0

        entry_volume * entry.ach.to_f * 1000 / 3600 / entry_surface
      end

    @nlr = values.empty? ? 0 : values.sum / values.size
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
