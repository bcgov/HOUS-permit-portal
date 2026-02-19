FactoryBot.define do
  factory :overheating_tool do
    association :user
    form_type { "single_zone_cooling_heating_tool" }
    form_json do
      {
        project_number: "PRJ-123",
        building_location: {
          address: "123 Main St"
        }
      }
    end
  end
end
