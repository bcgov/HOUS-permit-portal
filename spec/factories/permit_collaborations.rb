FactoryBot.define do
  factory :permit_collaboration do
    association :collaborator
    association :permit_application

    collaboration_type { :submission }
    collaborator_type { :delegatee }

    trait :submission do
      collaboration_type { :submission }
    end

    trait :review do
      collaboration_type { :review }
    end

    trait :delegatee do
      collaborator_type { :delegatee }
    end

    trait :assignee do
      collaborator_type { :assignee }
    end
  end
end
