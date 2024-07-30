FactoryBot.define do
  factory :revision_request do
    reason_code { "default_reason_code" }
    requirement_json { {} }
    submission_json { {} }
    comment { "Default comment" }
    association :submission_version
    association :user, factory: %i[user reviewer]
    created_at { Time.current }
    updated_at { Time.current }
  end
end
