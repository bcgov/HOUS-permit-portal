class StepCode::Compliance::CheckRequirements::ZeroCarbon::Prescriptive < StepCode::Compliance::CheckRequirements::ZeroCarbon::Base
  def requirements_met?
    heating_passed? && hot_water_passed? && other_passed?
  end

  def prescriptive_heating
    @heating ||=
      min(
        "CASE WHEN GREATEST(heating_furnace, heating_boiler, heating_combo) > 1 THEN 'carbon' ELSE 'zero_carbon' END"
      ).to_sym
  end

  def prescriptive_heating_requirement
    @prescriptive_heating_requirement ||=
      StepCode::Part9::References::ZERO_CARBON_REFERENCES.dig(
        step,
        :fuel_type_heating
      )
  end

  def prescriptive_hot_water
    @prescriptive_hot_water ||= total(:hot_water) > 1 ? :carbon : :zero_carbon
  end

  def prescriptive_hot_water_requirement
    @prescriptive_hot_water_requirement ||=
      StepCode::Part9::References::ZERO_CARBON_REFERENCES.dig(
        step,
        :fuel_type_hot_water
      )
  end

  def prescriptive_other
    @prescriptive_other ||=
      min(
        "CASE WHEN GREATEST(cooking, laundry) > 1 THEN 'carbon' ELSE 'zero_carbon' END"
      ).to_sym
  end

  def prescriptive_other_requirement
    @prescriptive_other_requirement ||=
      StepCode::Part9::References::ZERO_CARBON_REFERENCES.dig(
        step,
        :fuel_type_other
      )
  end

  private

  def heating_passed?
    !prescriptive_heating_requirement ||
      heating_rating >= heating_requirement_rating
  end

  def heating_rating
    @heating_rating ||=
      StepCode::Part9::References::FUEL_TYPE_RATINGS[prescriptive_heating]
  end

  def heating_requirement_rating
    @heating_requirement_rating ||=
      StepCode::Part9::References::FUEL_TYPE_RATINGS[
        prescriptive_heating_requirement
      ]
  end

  def hot_water_passed?
    !prescriptive_hot_water_requirement ||
      hot_water_rating >= hot_water_requirement_rating
  end

  def hot_water_rating
    @hot_water_rating ||=
      StepCode::Part9::References::FUEL_TYPE_RATINGS[prescriptive_hot_water]
  end

  def hot_water_requirement_rating
    @hot_water_requirement_rating ||=
      StepCode::Part9::References::FUEL_TYPE_RATINGS[
        prescriptive_hot_water_requirement
      ]
  end

  def other_passed?
    !prescriptive_other_requirement || other_rating >= other_requirement_rating
  end

  def other_rating
    @other_rating ||=
      StepCode::Part9::References::FUEL_TYPE_RATINGS[prescriptive_other]
  end

  def other_requirement_rating
    @other_requirement_rating ||=
      StepCode::Part9::References::FUEL_TYPE_RATINGS[
        prescriptive_other_requirement
      ]
  end
end
