class StepCode::Part3::V0::Requirements::References::ZeroCarbon
  LOOKUP = [
    { type: :residential, level: "el_1", ghgi: "Measure Only" },
    { type: :residential, level: "el_2", ghgi: 7.0 },
    { type: :residential, level: "el_3", ghgi: 3.0 },
    { type: :residential, level: "el_4", ghgi: 1.8 },
    { type: :office, level: "el_1", ghgi: "Measure Only" },
    { type: :office, level: "el_2", ghgi: 5.0 },
    { type: :office, level: "el_3", ghgi: 3.0 },
    { type: :office, level: "el_4", ghgi: 1.5 },
    { type: :retail, level: "el_1", ghgi: "Measure Only" },
    { type: :retail, level: "el_1", ghgi: 6.0 },
    { type: :retail, level: "el_1", ghgi: 3.0 },
    { type: :retail, level: "el_1", ghgi: 2.0 },
    { type: :hotel_motel, level: "el_1", ghgi: "Measure Only" },
    { type: :hotel_motel, level: "el_2", ghgi: 9.0 },
    { type: :hotel_motel, level: "el_3", ghgi: 4.0 },
    { type: :hotel_motel, level: "el_4", ghgi: 2.0 }
  ]

  def self.value(major_occupancy_type, level)
    found_value =
      LOOKUP.find do |item|
        item[:type] == major_occupancy_type && item[:level] == level
      end || {}
    { ghgi: found_value[:ghgi] }
  end
end
