FactoryBot.define do
  factory :part_9_checklist, class: Part9StepCode::Checklist do
    stage { :pre_construction }

    trait :marked_complete do
      status { :complete }
      section_completion_status do
        Part9StepCode::Checklist.fully_complete_section_completion_status
      end
    end
  end
end
