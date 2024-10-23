FactoryBot.define do
  factory :live_requirement_template do
    permit_type do
      PermitType.first || association(:permit_type, code: :low_residential)
    end
    activity do
      Activity.first || association(:activity, code: :new_construction)
    end

    factory :live_requirement_template_with_sections do
      transient { sections_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section,
          evaluator.sections_count,
          requirement_template: template
        )
      end
    end

    factory :live_full_requirement_template do
      transient { sections_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section_with_template_section_blocks,
          evaluator.sections_count,
          requirement_template: template
        )
      end
    end

    # default a template with some municipality and regional district
    factory :live_requirement_template_with_compliance do
      after(:create) do |template|
        create_list(
          :requirement_template_section,
          1,
          requirement_template: template
        ).each do |section|
          create_list(:requirement_block, 1).each do |block|
            create(
              :template_section_block,
              requirement_template_section: section,
              requirement_block: block
            )
            create(
              :requirement,
              requirement_code: "municipality_feature_sqm",
              requirement_block: block,
              input_type: :text,
              input_options: {
                computed_compliance: {
                  module: "ParcelInfoExtractor",
                  value: "FEATURE_AREA_SQM"
                }
              }
            )
            create(
              :requirement,
              requirement_code: "regional_district_feature_sqm",
              requirement_block: block,
              input_type: :text,
              input_options: {
                computed_compliance: {
                  module: "ParcelInfoExtractor",
                  value: "FEATURE_AREA_SQM"
                }
              }
            )
            create(
              :requirement,
              requirement_code: "no_compliance",
              requirement_block: block,
              input_type: :text
            )
            create(
              :requirement,
              requirement_code: "seal_test_file",
              requirement_block: block,
              input_type: :file,
              input_options: {
                computed_compliance: {
                  module: "DigitalSealValidator",
                  trigger: "on_save",
                  value_on: "compliance_data"
                }
              }
            )
          end
        end
        # publish a template_version
        create(
          :template_version,
          requirement_template: template,
          form_json: template.to_form_json,
          status: "published"
        )
        template.reload
      end
    end

    factory :live_requirement_template_with_heritage do
      after(:create) do |template|
        create_list(
          :requirement_template_section,
          1,
          requirement_template: template
        ).each do |section|
          create_list(:requirement_block, 1).each do |block|
            create(
              :template_section_block,
              requirement_template_section: section,
              requirement_block: block
            )
            create(
              :requirement,
              requirement_code: "heritage_resource",
              requirement_block: block,
              input_type: :select,
              input_options: {
                value_options: [
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" }
                ],
                computed_compliance: {
                  module: "HistoricSite",
                  value: "HISTORIC_SITE_IND",
                  options_map: {
                    "Y" => "true"
                  }
                }
              }
            )
          end
        end
        # publish a template version
        create(
          :template_version,
          requirement_template: template,
          form_json: template.to_form_json,
          status: "published"
        )
        template.reload
      end
    end
  end
end
