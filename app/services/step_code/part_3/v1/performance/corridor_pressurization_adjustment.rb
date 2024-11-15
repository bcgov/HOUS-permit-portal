class StepCode::Part3::V1::Performance::CorridorPressurizationAdjustment < StepCode::Part3::V1::Performance::Base
  private

  def teui
    super { tedi }
  end

  def tedi
    super { whole_building_adjustment }
  end

  def ghgi
    super {}
    # teui * make-up air emissions factor (calculate from checklist.make_up_air_fuels based on percent_of_load)
  end

  def total_energy
    super {}
  end

  def whole_building_adjustment
    # result = checklist.heating_degree_days * (0.029 * checklist.pressurized_doors_count * checklist.pressurization_airflow_per_door - 0.0073 * checklist.pressurized_cooridors_area) / total MFA (for both section B + C)
    # return result or 10, whichever is smaller
    # return zero if above result is negative
  end
end
