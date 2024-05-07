FactoryBot.define do
  factory :requirement do
    label { Faker::Lorem.words(number: 4).join(" ") }
    input_type { 0 }
    input_options { {} }
    hint { nil }
    required { false }
    elective { false }
    related_content { nil }
    required_for_in_person_hint { false }
    required_for_multiple_owners { false }

    association :requirement_block
  end
end
