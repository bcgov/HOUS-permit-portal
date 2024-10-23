FactoryBot.define do
  factory :early_access_requirement_template do
    permit_type do
      PermitType.first || association(:permit_type, code: :low_residential)
    end
    activity do
      Activity.first || association(:activity, code: :new_construction)
    end

    factory :early_access_requirement_template_with_sections do
      transient { sections_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section,
          evaluator.sections_count,
          requirement_template: template
        )
      end
    end

    factory :early_access_full_requirement_template do
      transient { sections_count { 5 } }

      after(:create) do |template, evaluator|
        template.requirement_template_sections << create_list(
          :requirement_template_section_with_template_section_blocks,
          evaluator.sections_count,
          requirement_template: template
        )
      end
    end
  end
end
