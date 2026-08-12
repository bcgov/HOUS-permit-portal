FactoryBot.define do
  factory :part_3_checklist, class: Part3StepCode::Checklist do
    stage { :pre_construction }
    heating_degree_days { 2910 }
    climate_zone { "zone_4" }
    section_completion_status { {} }

    trait :marked_complete do
      status { :complete }
      section_completion_status do
        Part3StepCode::Checklist.fully_complete_section_completion_status
      end
    end
  end
end
