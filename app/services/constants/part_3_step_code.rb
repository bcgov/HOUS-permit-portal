module Constants
  module Part3StepCode
    OVERHEATING_HOURS_LIMIT = 200

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

    BUILDING_CODE_VERSION_LOOKUP = {
      BCBC_2024: Date.new(2024, 3, 8),
      BCBC_2018_rev_5: Date.new(2023, 5, 1),
      BCBC_2018_rev_4: Date.new(2020, 9, 21),
      BCBC_2018_rev_3: Date.new(2020, 4, 30),
      BCBC_2018_rev_2: Date.new(2019, 12, 12),
      BCBC_2018_rev_1: Date.new(2018, 12, 10)
    }
  end
end
