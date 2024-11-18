class StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment < StepCode::Part3::V1::Performance::Base
  private

  def teui
    super { tedi[:whole_building] }
  end

  def tedi
    super do
      {
        whole_building: whole_building_adjustment,
        step_code_portion: step_code_portion_adjustment
      }
    end
  end

  def ghgi
    super { (teui * make_up_air_emissions_factor) }
  end

  def total_energy
    super { teui }
  end

  def make_up_air_emissions_factor
    @make_up_air_emissions_factor ||=
      checklist.make_up_air_fuels.sum do |fuel_entry|
        fuel_entry.percent_of_load * fuel_entry.fuel_type.emissions_factor
      end
  end

  def whole_building_adjustment
    result = pressurization_energy / total_mfa
    result >= 0 ? [result, 10.0].min : 0 # (kWh/m²/yr)
  end

  def step_code_portion_adjustment
    return 0 if step_code_mfa == 0

    result = pressurization_energy / step_code_mfa
    result >= 0 ? [result, 10.0].min : 0 # (kWh/m²/yr)
  end

  def pressurization_energy
    @pressurization_energy ||=
      checklist.heating_degree_days *
        (
          0.029 * pressurized_doors_count * pressurization_airflow_per_door -
            0.0073 * pressurized_corridors_area
        )
  end

  def pressurized_doors_count
    @pressurized_doors_count ||= checklist.pressurized_doors_count || 0
  end

  def pressurization_airflow_per_door
    @pressurization_airflow_per_door ||=
      checklist.pressurization_airflow_per_door || 0
  end

  def pressurized_corridors_area
    @pressurized_corridors_area ||= checklist.pressurized_corridors_area || 0
  end
end
