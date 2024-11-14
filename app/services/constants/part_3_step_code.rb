module Constants
  module Part3StepCode
    OCCUPANCIES_LOOKUP = {
      performing_arts_assembly: {
        type: :baseline
      },
      other_assembly: {
        type: :baseline
      },
      arena_assembly: {
        type: :baseline
      },
      open_air_assembly: {
        type: :baseline
      },
      detention: {
        type: :baseline
      },
      treatment: {
        type: :baseline
      },
      care: {
        type: :baseline
      },
      hotel_motel: {
        type: :step_code,
        major_occupancy_type: :hotel_motel
      },
      residential: {
        type: :step_code,
        major_occupancy_type: :residential
      },
      office: {
        type: :step_code,
        major_occupancy_type: :office
      },
      other: {
        type: :step_code,
        major_occupancy_type: :office
      },
      mercantile: {
        type: :step_code,
        major_occupancy_type: :retail
      },
      high_hazard_industrial: {
        type: :baseline
      },
      medium_hazard_industrial: {
        type: :baseline
      },
      low_hazard_industrial: {
        type: :baseline
      }
    }
  end
end
