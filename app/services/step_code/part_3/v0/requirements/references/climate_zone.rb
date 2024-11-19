class StepCode::Part3::V0::Requirements::References::ClimateZone
  LOOKUP = {
    "zone_4" => 2999,
    "zone_5" => 3999,
    "zone_6" => 4999,
    "zone_7A" => 5999,
    "zone_7B" => 6999,
    "zone_8" => 8000
  }

  def self.value(zone)
    LOOKUP[zone]
  end
end
