FactoryBot.define do
  factory :requirement_block do
    name { Faker::Lorem.unique.words(number: 2).join(" ") }
    display_name { Faker::Lorem.unique.words(number: 2).join(" ") }
    sign_off_role { 0 }
    reviewer_role { 0 }
    custom_validations { "{}" }

    factory :requirement_block_with_requirements do
      transient { requirements_count { 5 } }

      after(:create) do |requirement_block, evaluator|
        requirement_block.requirements << create_list(:requirement, evaluator.requirements_count)

        # You may need to reload the record here, depending on your application
        requirement_block.reload
      end
    end
  end
end
