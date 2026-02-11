FactoryBot.define do
  factory :part_3_checklist, class: Part3StepCode::Checklist do
    heating_degree_days { 2910 }
    climate_zone { "zone_4" }
    section_completion_status { {} }
  end
end
