class StepCode::Part9::References
  ZERO_CARBON_REFERENCES = {
    1 => {
      total_carbon: nil,
      carbon_per_floor_area: nil,
      carbon_per_floor_area_max: nil,
      fuel_type_heating: nil,
      fuel_type_hot_water: nil,
      fuel_type_other: nil
    },
    2 => {
      total_carbon: 1050,
      carbon_per_floor_area: 6,
      carbon_per_floor_area_max: 2400,
      fuel_type_heating: :zero_carbon,
      fuel_type_hot_water: nil,
      fuel_type_other: nil
    },
    3 => {
      total_carbon: 440,
      carbon_per_floor_area: 2.5,
      carbon_per_floor_area_max: 800,
      fuel_type_heating: :zero_carbon,
      fuel_type_hot_water: :zero_carbon,
      fuel_type_other: nil
    },
    4 => {
      total_carbon: 265,
      carbon_per_floor_area: 1.5,
      carbon_per_floor_area_max: 500,
      fuel_type_heating: :zero_carbon,
      fuel_type_hot_water: :zero_carbon,
      fuel_type_other: :zero_carbon
    }
  }

  FUEL_TYPE_RATINGS = { carbon: 2, zero_carbon: 3 }
end
