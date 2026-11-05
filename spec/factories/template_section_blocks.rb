FactoryBot.define do
  factory :template_section_block do
    transient { requirements_count { 5 } }
    association :requirement_template_section
    requirement_block do
      association(
        :requirement_block_with_requirements,
        requirements_count: requirements_count
      )
    end
  end
end
