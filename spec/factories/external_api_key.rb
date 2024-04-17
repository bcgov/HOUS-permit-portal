FactoryBot.define do
  factory :external_api_key do
    association :jurisdiction, factory: :sub_district
    name { Faker::Lorem.words(number: 2).join(" ") }
    expiration_date { nil }
  end
end
