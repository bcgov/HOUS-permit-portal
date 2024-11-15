class StepCode::Part3::V1::Performance::ResultsAsModelled < StepCode::Part3::V1::Performance::Base
  private

  def total_energy
    super { total_energy_use }
  end

  def teui
    super { total_energy_use / total_mfa }
  end

  def tedi
    super { checklist.total_annual_thermal_energy_demand / total_mfa }
  end

  def ghgi
    super { total_emissions / total_mfa }
  end

  def total_emissions
    @total_emissions ||=
      checklist
        .modelled_energy_outputs
        .joins(:fuel_type)
        .sum("annual_energy * fuel_types.emissions_factor")
  end

  def total_energy_use
    @total_energy_use ||=
      checklist.modelled_energy_outputs.sum(:annual_energy) -
        checklist.generated_electricity
  end

  def total_mfa
    @total_mfa ||= checklist.occupancy_classifications.sum(:modelled_floor_area)
  end
end
