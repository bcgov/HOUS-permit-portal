FactoryBot.define do
  factory :project_membership do
    association :permit_project
    association :user, factory: :user, role: "submitter"
    role { :contributor }
    invited_email { user.email }
    accepted_at { Time.current }

    trait :lead do
      role { :lead }
    end

    trait :pending do
      user { nil }
      accepted_at { nil }
      sequence(:invited_email) { |n| "pending-invite-#{n}@example.com" }
    end
  end
end
