FactoryBot.define do
  factory :requirement_question do
    label { Faker::Lorem.unique.words(number: 4).join(" ") }
    input_type { 0 }
    input_options { {} }
    hint { nil }
    instructions { nil }
    shared { false }
  end
end
