FactoryBot.define do
  factory :jurisdiction_climate_zone do
    association :jurisdiction, factory: :sub_district
    climate_zone { "zone_5" }
    heating_degree_days { 4180 }
  end
end
