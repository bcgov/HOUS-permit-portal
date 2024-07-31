FactoryBot.define do
  factory :submission_version do
    form_json { {} }
    submission_data { {} }
    viewed_at { nil }
    created_at { Time.current }
    updated_at { Time.current }
    association :permit_application

    trait :viewed do
      viewed_at { Time.current }
    end
  end
end
