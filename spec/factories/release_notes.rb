FactoryBot.define do
  factory :release_note do
    release_type { :software }
    version { Faker::App.unique.semantic_version }
    release_notes_url { Faker::Internet.url }
    release_date { Faker::Date.between(from: 1.year.ago, to: Time.current) }
    content { Faker::Lorem.paragraph }
    issues { Faker::Lorem.paragraph }

    trait :content do
      release_type { :content }
      version { nil }
      release_notes_url { nil }
      name { Faker::Lorem.words(number: 3).join(" ") }
    end
  end
end
