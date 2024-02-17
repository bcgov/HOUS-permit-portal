FactoryBot.define do
  factory :requirement_template do
    association :activity, factory: :activity
    association :permit_type, factory: :permit_type
    status { :published }

    # Add additional attributes for RequirementTemplate here if needed

    #default a template with some municipality and regional district
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
