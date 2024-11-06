class StepCode::Part3::V0::Requirements::References::ClimateZone
  LOOKUP = {
    "4" => 2999,
    "5" => 3999,
    "6" => 4999,
    "7A" => 5999,
    "7B" => 6999,
    "8" => 8000
  }

  def self.value(zone)
    LOOKUP[zone]
  end
end
