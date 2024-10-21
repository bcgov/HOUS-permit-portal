# MEUI - Mechanical Energy Use Intensity

class StepCode::Compliance::CheckRequirements::Energy::MEUI < StepCode::Compliance::CheckRequirements::Energy::Base
  def requirements_met?
    (meui != 0 && meui <= meui_requirement) ||
      meui_percent_improvement >= meui_percent_improvement_requirement
  end

  def meui
    @meui ||= energy_target / total_heated_floor_area * KWH_PER_GJ
  end

  def energy_target
    total(:aec) - total(:baseloads)
  end

  def meui_requirement
    MechanicalEnergyUseIntensityReference.find_by(
      "hdd @> :hdd AND conditioned_space_percent @> :conditioned_percent AND step = :step AND conditioned_space_area @> :conditioned_area",
      hdd: total(:hdd),
      step: step,
      conditioned_percent:,
      conditioned_area: total_heated_floor_area.round
    ).meui
  end

  def conditioned_percent
    @conditioned_percent ||=
      total_cooling_capacity / total(:design_cooling_load)
  end

  def total_cooling_capacity
    @total_cooling_capacity ||=
      (
        total(:ac_cooling_capacity) + total(:air_heat_pump_cooling_capacity) +
          total(:grounded_heat_pump_cooling_capacity) +
          total(:water_heat_pump_cooling_capacity)
      ) * 1000
  end

  def meui_percent_improvement_requirement
    if total(:building_volume) > 300
      tedi_reference.ltrh_over_300
    else
      tedi_reference.ltrh_under_300
    end
  end

  def meui_percent_improvement
    return nil if ref_energy_target == 0 || checklist.step_code?
    @meui_improvement_percentage ||=
      (
        (ref_energy_target - energy_consumption) / ref_energy_target * 100
      ).round(2)
  end

  def ref_energy_target
    @ref_energy_target ||= total(:ref_aec) - total(:baseloads)
  end

  def energy_consumption
    @energy_consumption ||= total(:aec) - total(:baseloads)
  end
end
