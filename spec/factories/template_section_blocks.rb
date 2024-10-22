FactoryBot.define do
  factory :template_section_block do
    association :requirement_template_section
    association :requirement_block,
                factory: :requirement_block_with_requirements
  end
end
