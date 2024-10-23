FactoryBot.define do
  factory :external_api_key do
    association :jurisdiction,
                factory: :sub_district,
                external_api_enabled: true
    name { Faker::Lorem.words(number: 4).join(" ") }
    connecting_application { Faker::Lorem.words(number: 2).join(" ") }
    expired_at { Time.now + 1.day }
    revoked_at { nil }
  end
end
