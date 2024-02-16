FactoryBot.define do
  factory :requirement_template do
    association :activity, factory: :activity
    association :permit_type, factory: :permit_type
    status { :published }

    factory :requirement_template_with_sections do
      transient { template_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section,
          evaluator.template_count,
          requirement_template: template,
        )
      end
    end

    # default a template with some municipality and regional district
    factory :requirement_template_with_compliance do
      after(:create) do |template|
        create_list(:requirement_template_section, 1, requirement_template: template).each do |section|
          create_list(:requirement_block, 1).each do |block|
            create(:template_section_block, requirement_template_section: section, requirement_block: block)
            create(
              :requirement,
              requirement_code: "municipality",
              requirement_block: block,
              input_type: :text,
              input_options: {
                computed_compliance: {
                  module: "ParcelInfoExtractor",
                  value: "MUNICIPALITY",
                },
              },
            )
            create(
              :requirement,
              requirement_code: "regional_district",
              requirement_block: block,
              input_type: :text,
              input_options: {
                computed_compliance: {
                  module: "ParcelInfoExtractor",
                  value: "REGIONAL_DISTRICT",
                },
              },
            )
          end
        end
      end
    end
  end
end
