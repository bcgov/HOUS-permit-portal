FactoryBot.define do
  factory :permit_type_submission_contact do
    association :jurisdiction
    permit_type do
      PermitType.first || association(:permit_type, code: :low_residential)
    end
    email { Faker::Internet.email }
    confirmation_token { Devise.friendly_token }
    confirmation_sent_at { Time.now.utc - 1.day }
    confirmed_at { Time.now.utc }
  end
end
