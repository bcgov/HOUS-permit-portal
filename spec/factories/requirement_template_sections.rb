FactoryBot.define do
  factory :requirement_template_section do
    association :requirement_template
    name { "MyString" }
    position { 1 }

    initialize_with { new(attributes).tap { |section| section.id = attributes[:id] || SecureRandom.uuid } }
  end
end
