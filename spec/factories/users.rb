FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    username { Faker::Internet.username }
    password { "P@ssword1" }

    trait :submitter do
      role { :submitter }
      sequence :email do |n|
        "submitter#{n}@example.com"
      end
      sequence :username do |n|
        "submitter#{n}"
      end
    end

    trait :review_manager do
      role { :review_manager }
      sequence :email do |n|
        "review_manager#{n}@example.com"
      end
      sequence :username do |n|
        "review_manager#{n}"
      end
      association :local_jurisdiction
    end

    trait :reviewer do
      role { :reviewer }
      sequence :email do |n|
        "reviewer#{n}@example.com"
      end
      sequence :username do |n|
        "reviewer#{n}"
      end
      association :local_jurisdiction
    end

    trait :super_admin do
      role { :super_admin }
      sequence :email do |n|
        "super_admin#{n}@example.com"
      end
      sequence :username do |n|
        "super_admin#{n}"
      end
      password { "P@ssword1" }
    end

    after(:build) do |user|
      user.skip_confirmation_notification!
      user.confirm
    end
  end
end
