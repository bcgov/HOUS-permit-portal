class StepCode::Compliance::CheckRequirements::ZeroCarbon::Prescriptive < StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  def requirements_met?
    heating_passed? && hot_water_passed? && other_passed?
  end

  private

  def heating_passed?
    StepCode::References::FUEL_TYPE_RATINGS[heating] >= StepCode::References::FUEL_TYPE_RATINGS[heating_requirement]
  end

  def heating
    min(
      "CASE WHEN GREATEST(heating_furnace, heating_boiler, heating_combo) > 1 THEN 'carbon' ELSE 'zero_carbon' END",
    ).to_sym
  end

  def heating_requirement
    ZERO_CARBON_REFERENCES.dig(step, :fuel_type_heating)
  end

  def hot_water_passed?
    StepCode::References::FUEL_TYPE_RATINGS[hot_water] >= StepCode::References::FUEL_TYPE_RATINGS[hot_water_requirement]
  end

  def hot_water
    total(:hot_water) > 1 ? :carbon : :zero_carbon
  end

  def hot_water_requirement
    ZERO_CARBON_REFERENCES.dig(step, :fuel_type_hot_water)
  end

  def other_passed?
    StepCode::References::FUEL_TYPE_RATINGS[other] >= StepCode::References::FUEL_TYPE_RATINGS[other_requirement]
  end

  def other
    min("CASE WHEN GREATEST(cooking, laundry) > 1 THEN 'carbon' ELSE 'zero_carbon' END").to_sym
  end

  def other_requirement
    StepCode::Reference::ZERO_CARBON_REFERENCES.dig(step, :fuel_type_other)
  end
end
