FactoryBot.define do
  factory :user do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    nickname { "#{first_name}-#{last_name.first}-#{[0..999].sample}" }
    email { "#{nickname}-#{[0..999].sample}@example.com" }
    password { ENV["TESTING_DEFAULT_PASSWORD"] || "P@ssword1" }

    trait :submitter do
      role { :submitter }
    end

    trait :review_manager do
      role { :review_manager }
      association :jurisdiction
    end

    trait :reviewer do
      role { :reviewer }
      association :jurisdiction
    end

    trait :super_admin do
      role { :super_admin }
      password { "P@ssword1" }
    end

    after(:build) do |user|
      user.skip_confirmation_notification!
      user.confirm
    end
  end
end
