FactoryBot.define do
  factory :submission_contact do
    association :jurisdiction
    email { Faker::Internet.email }
    title { "Building Inspector" }
    default { false }
    confirmation_token { Devise.friendly_token }
    confirmation_sent_at { Time.now.utc - 1.day }
    confirmed_at { Time.now.utc }
  end
end
