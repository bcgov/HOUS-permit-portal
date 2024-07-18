FactoryBot.define do
  factory :submission_version do
    association :permit_application
    form_json { {} }
    submission_data { {} }
    created_at { Time.now }
    updated_at { Time.now }
  end
end
