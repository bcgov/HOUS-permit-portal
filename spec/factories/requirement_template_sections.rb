FactoryBot.define do
  factory :requirement_template_section do
    association :requirement_template
    name { Faker::Lorem.unique.words(number: 2).join(" ") }

    initialize_with do
      new(attributes).tap do |section|
        section.id = attributes[:id] || SecureRandom.uuid
      end
    end

    factory :requirement_template_section_with_template_section_blocks do
      transient { template_section_blocks_count { 5 } }

      after(:create) do |requirement_template_section, evaluator|
        requirement_template_section.template_section_blocks << create_list(
          :template_section_block,
          evaluator.template_section_blocks_count,
          requirement_template_section: requirement_template_section
        )

        # You may need to reload the record here, depending on your application
        requirement_template_section.reload
      end
    end
  end
end
