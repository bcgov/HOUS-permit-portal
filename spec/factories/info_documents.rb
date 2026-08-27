FactoryBot.define do
  factory :info_document do
    sequence(:title) { |n| "Info document #{n}" }
    description { "A short public guide or fact sheet." }
    topic_list { %w[cost] }
    published_at { nil }

    trait :with_file do
      file_data { TestData.file_data }
      scan_status { "clean" }
    end

    trait :published do
      with_file
      published_at { Time.current }
    end
  end
end
