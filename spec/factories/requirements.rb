FactoryBot.define do
  factory :requirement do
    requirement_code { Faker::Alphanumeric.unique.alpha }
    label { Faker::Lorem.words(number: 2).join(" ") }
    input_type { 0 }
    input_options { "{}" }
    hint { nil }
    required { false }
    related_content { nil }
    required_for_in_person_hint { false }
    required_for_multiple_owners { false }
  end
end
