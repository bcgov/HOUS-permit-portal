# spec/factories/jurisdiction_template_version_customizations.rb
FactoryBot.define do
  factory :jurisdiction_template_version_customization do
    association :jurisdiction, factory: :sub_district
    association :template_version
    sandbox { nil }

    # Use a transient attribute to allow passing custom data
    transient { customizations_data { {} } }

    # Set the customizations attribute using the transient data
    customizations { { "requirement_block_changes" => customizations_data } }

    # You can define traits for common customization scenarios
    trait :with_requirement_blocks do
      transient { blocks { {} } }

      after(:build) do |customization, evaluator|
        customization.customizations[
          "requirement_block_changes"
        ] = evaluator.blocks
      end
    end
  end
end
