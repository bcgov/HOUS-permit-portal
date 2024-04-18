FactoryBot.define do
  factory :external_api_key do
    association :jurisdiction, factory: :sub_district
    name { Faker::Lorem.words(number: 2).join(" ") }
    expired_at { nil }
    revoked_at { nil }
  end
end
