FactoryBot.define do
  factory :project_membership do
    association :permit_project
    association :user, factory: :user, role: "submitter"
    role { :contributor }

    trait :lead do
      role { :lead }
    end
  end
end
