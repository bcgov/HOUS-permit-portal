FactoryBot.define do
  factory :requirement_question do
    label { Faker::Lorem.unique.words(number: 4).join(" ") }
    input_type { 0 }
    input_options { {} }
    hint { nil }
    instructions { nil }
    name { Faker::Lorem.unique.words(number: 3).join(" ") }
    description { Faker::Lorem.sentence }
  end
end
