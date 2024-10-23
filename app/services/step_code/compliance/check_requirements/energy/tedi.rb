# TEDI - Thermal Energy Demand Intensity (kWh/m^2/year)
# HLR - Heat Loss Reduction
# GSHL - Gross Space Heat Loss

class StepCode::Compliance::CheckRequirements::Energy::TEDI < StepCode::Compliance::CheckRequirements::Energy::Base
  def requirements_met?
    (tedi != 0 && tedi <= tedi_requirement) ||
      tedi_hlr_percent >= tedi_hlr_percent_requirement
  end

  def tedi
    @tedi ||=
      total(:aux_energy_required) / 1000 / total_heated_floor_area * KWH_PER_GJ
  end

  def tedi_requirement
    @tedi_requirement ||= tedi_reference.hdd_adjusted_tedi
  end

  def tedi_hlr_percent_requirement
    if total(:building_volume) > 300
      tedi_reference.gshl_under_300
    else
      tedi_reference.gshl_over_300
    end
  end

  def tedi_hlr_percent
    reference = total(:ref_gshl)
    return 0 if reference == 0 || checklist.compliance_path == :step_code
    ((reference - total(:proposed_gshl)) / reference * 100).round(0)
  end
end
