FactoryBot.define do
  factory :overheating_code do
    association :creator, factory: :user
    association :jurisdiction, factory: :sub_district
    status { "draft" }
    issued_to { "Test User" }
    project_number { "PRJ-#{SecureRandom.hex(3).upcase}" }
    full_address { "123 Test St" }

    trait :complete do
      pid { "123-456-789" }
      building_model { "Standard Model" }
      site_name { "Test Site" }
      lot { "12" }
      postal_code { "V7L 1C3" }
      designated_rooms { "Living Room, Bedroom" }
      cooling_zone_units { "metric" }
      minimum_cooling_capacity { 3.5 }
      design_outdoor_temp { 31.0 }
      design_indoor_temp { 24.0 }
      design_adjacent_temp { 31.0 }
      cooling_zone_area { 85.0 }
      weather_location { "Vancouver Int'l A" }
      ventilation_rate { 17.5 }
      hrv_erv { true }
      atre_percentage { 23.0 }
      components_facing_outside { ["Exterior wall R-20", "Roof/ceiling R-40"] }
      components_facing_adjacent { ["Party wall R-10"] }
      document_notes { ["F280 report attached"] }
      performer_name { "Jane Doe" }
      performer_company { "HVAC Consulting Inc." }
      performer_address { "456 Oak Ave" }
      performer_city_province { "Vancouver, BC" }
      performer_postal_code { "V6B 2K1" }
      performer_phone { "604-555-0100" }
      performer_fax { "604-555-0101" }
      performer_email { "jane@hvac.example.com" }
      accreditation_ref1 { "ACC-2026-001" }
      accreditation_ref2 { "ACC-2026-002" }
      issued_for1 { "2026-02-24" }
      issued_for2 { "2026-03-01" }
    end

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end
