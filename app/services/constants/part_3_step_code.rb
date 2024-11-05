module Constants
  module Part3StepCode
    OCCUPANCIES_LOOKUP = {
      performing_arts_assembly: {
        type: :reference_building
      },
      other_assembly: {
        type: :reference_building
      },
      arena_assembly: {
        type: :reference_building
      },
      open_air_assembly: {
        type: :reference_building
      },
      detention: {
        type: :reference_building
      },
      treatment: {
        type: :reference_building
      },
      care: {
        type: :reference_building
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
        type: :reference_building
      },
      medium_hazard_industrial: {
        type: :reference_building
      },
      low_hazard_industrial: {
        type: :reference_building
      }
    }
  end
end
