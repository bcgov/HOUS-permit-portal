FactoryBot.define do
  factory :jurisdiction_heating_degree_day do
    association :jurisdiction, factory: :sub_district
    location_name { "General" }
    heating_degree_days { 4180 }
  end
end
