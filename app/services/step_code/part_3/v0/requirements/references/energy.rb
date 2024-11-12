class StepCode::Part3::V0::Requirements::References::Energy
  LOOKUP = [
    { type: :residential, zone: :zone_4, step: :step_2, teui: 130, tedi: 45 },
    { type: :residential, zone: :zone_4, step: :step_3, teui: 120, tedi: 30 },
    { type: :residential, zone: :zone_4, step: :step_4, teui: 100, tedi: 15 },
    { type: :residential, zone: :zone_5, step: :step_2, teui: 130, tedi: 45 },
    { type: :residential, zone: :zone_5, step: :step_3, teui: 120, tedi: 35 },
    { type: :residential, zone: :zone_5, step: :step_4, teui: 110, tedi: 22 },
    { type: :residential, zone: :zone_6, step: :step_2, teui: 135, tedi: 50 },
    { type: :residential, zone: :zone_6, step: :step_3, teui: 120, tedi: 35 },
    { type: :residential, zone: :zone_6, step: :step_4, teui: 110, tedi: 22 },
    { type: :residential, zone: :zone_7A, step: :step_2, teui: 135, tedi: 55 },
    { type: :residential, zone: :zone_7A, step: :step_3, teui: 120, tedi: 40 },
    { type: :residential, zone: :zone_7A, step: :step_4, teui: 110, tedi: 22 },
    { type: :residential, zone: :zone_7B, step: :step_2, teui: 150, tedi: 60 },
    { type: :residential, zone: :zone_7B, step: :step_3, teui: 140, tedi: 50 },
    { type: :residential, zone: :zone_7B, step: :step_4, teui: 125, tedi: 35 },
    { type: :residential, zone: :zone_8, step: :step_2, teui: 180, tedi: 90 },
    { type: :residential, zone: :zone_8, step: :step_3, teui: 160, tedi: 75 },
    { type: :residential, zone: :zone_8, step: :step_4, teui: 140, tedi: 60 },
    { type: :office, zone: :zone_4, step: :step_2, teui: 110, tedi: 30 },
    { type: :office, zone: :zone_4, step: :step_3, teui: 100, tedi: 20 },
    { type: :office, zone: :zone_5, step: :step_2, teui: 110, tedi: 30 },
    { type: :office, zone: :zone_5, step: :step_3, teui: 100, tedi: 20 },
    { type: :office, zone: :zone_6, step: :step_2, teui: 110, tedi: 30 },
    { type: :office, zone: :zone_6, step: :step_3, teui: 100, tedi: 20 },
    { type: :office, zone: :zone_7A, step: :step_2, teui: 115, tedi: 30 },
    { type: :office, zone: :zone_7A, step: :step_3, teui: 110, tedi: 20 },
    { type: :office, zone: :zone_7B, step: :step_2, teui: 115, tedi: 30 },
    { type: :office, zone: :zone_7B, step: :step_3, teui: 110, tedi: 20 },
    { type: :office, zone: :zone_8, step: :step_2, teui: 115, tedi: 30 },
    { type: :office, zone: :zone_8, step: :step_3, teui: 110, tedi: 20 },
    { type: :retail, zone: :zone_4, step: :step_2, teui: 145, tedi: 30 },
    { type: :retail, zone: :zone_4, step: :step_3, teui: 120, tedi: 20 },
    { type: :retail, zone: :zone_5, step: :step_2, teui: 145, tedi: 30 },
    { type: :retail, zone: :zone_5, step: :step_3, teui: 125, tedi: 25 },
    { type: :retail, zone: :zone_6, step: :step_2, teui: 145, tedi: 45 },
    { type: :retail, zone: :zone_6, step: :step_3, teui: 130, tedi: 30 },
    { type: :retail, zone: :zone_7A, step: :step_2, teui: 170, tedi: 55 },
    { type: :retail, zone: :zone_7A, step: :step_3, teui: 150, tedi: 40 },
    { type: :retail, zone: :zone_7B, step: :step_2, teui: 170, tedi: 55 },
    { type: :retail, zone: :zone_7B, step: :step_3, teui: 150, tedi: 40 },
    { type: :retail, zone: :zone_8, step: :step_2, teui: 170, tedi: 55 },
    { type: :retail, zone: :zone_8, step: :step_3, teui: 150, tedi: 40 },
    { type: :hotel_motel, zone: :zone_4, step: :step_2, teui: 170, tedi: 30 },
    { type: :hotel_motel, zone: :zone_4, step: :step_3, teui: 140, tedi: 20 },
    { type: :hotel_motel, zone: :zone_4, step: :step_4, teui: 120, tedi: 15 },
    { type: :hotel_motel, zone: :zone_5, step: :step_2, teui: 170, tedi: 30 },
    { type: :hotel_motel, zone: :zone_5, step: :step_3, teui: 145, tedi: 21 },
    { type: :hotel_motel, zone: :zone_5, step: :step_4, teui: 130, tedi: 16 },
    { type: :hotel_motel, zone: :zone_6, step: :step_2, teui: 170, tedi: 30 },
    { type: :hotel_motel, zone: :zone_6, step: :step_3, teui: 145, tedi: 25 },
    { type: :hotel_motel, zone: :zone_6, step: :step_4, teui: 130, tedi: 18 },
    { type: :hotel_motel, zone: :zone_7A, step: :step_2, teui: 170, tedi: 32 },
    { type: :hotel_motel, zone: :zone_7A, step: :step_3, teui: 150, tedi: 28 },
    { type: :hotel_motel, zone: :zone_7A, step: :step_4, teui: 145, tedi: 20 },
    { type: :hotel_motel, zone: :zone_7B, step: :step_2, teui: 170, tedi: 32 },
    { type: :hotel_motel, zone: :zone_7B, step: :step_3, teui: 150, tedi: 28 },
    { type: :hotel_motel, zone: :zone_7B, step: :step_4, teui: 145, tedi: 20 },
    { type: :hotel_motel, zone: :zone_8, step: :step_2, teui: 170, tedi: 32 },
    { type: :hotel_motel, zone: :zone_8, step: :step_3, teui: 150, tedi: 28 },
    { type: :hotel_motel, zone: :zone_8, step: :step_4, teui: 145, tedi: 20 }
  ]

  def self.value(major_occupancy_type, climate_zone, step_value)
    found_value =
      LOOKUP.find do |item|
        item[:type] == major_occupancy_type && item[:zone] == climate_zone &&
          item[:step] == step_value
      end || {}
    { teui: found_value[:teui], tedi: found_value[:tedi] }
  end
end
