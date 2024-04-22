FactoryBot.define do
  factory :external_api_key do
    association :jurisdiction, factory: :sub_district, external_api_enabled: true
    name { Faker::Lorem.words(number: 2).join(" ") }
    expired_at { nil }
    revoked_at { nil }
  end
end
