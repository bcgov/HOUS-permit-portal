FactoryBot.define do
  factory :release_note do
    version { Faker::App.semantic_version }
    release_date { Faker::Date.between(from: 1.year.ago, to: Time.current) }
    content { Faker::Lorem.paragraph }
    release_notes_url { Faker::Internet.url }
    issues { Faker::Lorem.paragraph }
  end
end
