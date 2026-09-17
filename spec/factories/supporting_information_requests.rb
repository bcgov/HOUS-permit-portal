FactoryBot.define do
  factory :supporting_information_request do
    title { "Site plan" }
    comment { "Please provide a current site plan." }
    association :submission_version
    association :user, factory: %i[user reviewer]
  end
end
