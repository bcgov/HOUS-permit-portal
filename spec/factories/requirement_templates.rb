FactoryBot.define do
  factory :requirement_template do
    association :activity, factory: :activity
    association :permit_type, factory: :permit_type
    status { :published }

    factory :requirement_template_with_sections do
      transient { sections_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section,
          evaluator.sections_count,
          requirement_template: template,
        )
      end
    end

    factory :full_requirement_template do
      transient { sections_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section_with_template_section_blocks,
          evaluator.sections_count,
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

    factory :requirement_template_with_heritage do
      after(:create) do |template|
        create_list(:requirement_template_section, 1, requirement_template: template).each do |section|
          create_list(:requirement_block, 1).each do |block|
            create(:template_section_block, requirement_template_section: section, requirement_block: block)
            create(
              :requirement,
              requirement_code: "heritage_resource",
              requirement_block: block,
              input_type: :checkbox,
              input_options: {
                value_options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }],
                computed_compliance: {
                  module: "HistoricSite",
                  value: "HISTORIC_SITE_IND",
                },
              },
            )
          end
        end
      end
    end
  end
end
