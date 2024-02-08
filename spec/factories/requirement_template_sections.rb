FactoryBot.define do
  factory :requirement_template_section do
    name { "MyString" }
    requirement_template { nil }
    position { 1 }

    initialize_with { new(attributes).tap { |section| section.id = attributes[:id] || SecureRandom.uuid } }
  end
end
