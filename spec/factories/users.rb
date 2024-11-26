FactoryBot.define do
  factory :user do
    transient { confirmed { true } }

    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { "#{first_name}-#{[0..999].sample}@example.com" }
    password { ENV["TESTING_DEFAULT_PASSWORD"] || "P@ssword1" }

    trait :submitter do
      role { :submitter }
    end

    trait :review_manager do
      role { :review_manager }
      association :jurisdiction, factory: :sub_district
    end

    trait :reviewer do
      role { :reviewer }
      association :jurisdiction, factory: :sub_district
    end

    trait :regional_review_manager do
      role { :regional_review_manager }
      association :jurisdiction, factory: :sub_district
    end

    trait :super_admin do
      role { :super_admin }
      password { "P@ssword1" }
    end

    transient do
      jurisdictions_count { 1 }
      jurisdiction { build(:jurisdiction, factory: :sub_district) }
    end

    after(:build) do |user, context|
      if context.confirmed
        user.skip_confirmation_notification!
        user.confirm
      end

      if user.review_staff?
        create_list(
          :jurisdiction_membership,
          context.jurisdictions_count,
          user: user,
          jurisdiction: context.jurisdiction
        )
        user.reload
      end
    end
  end
end
