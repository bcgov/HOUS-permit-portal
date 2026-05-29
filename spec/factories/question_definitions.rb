FactoryBot.define do
  factory :question_definition do
    label { Faker::Lorem.unique.words(number: 4).join(" ") }
    input_type { 0 }
    input_options { {} }
    hint { nil }
    instructions { nil }
    requirement_code { nil }
    review_state { :draft }
  end
end
