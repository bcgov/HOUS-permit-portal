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
        type: :step_code
      },
      residential: {
        type: :step_code
      },
      office: {
        type: :step_code
      },
      other: {
        type: :step_code
      },
      mercantile: {
        type: :step_code
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
