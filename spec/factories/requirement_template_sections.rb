FactoryBot.define do
  factory :requirement_template_section do
    association :requirement_template
    name { Faker::Lorem.unique.words(number: 2).join(" ") }

    initialize_with { new(attributes).tap { |section| section.id = attributes[:id] || SecureRandom.uuid } }
  end
end
