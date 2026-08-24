FactoryBot.define do
  factory :info_document do
    sequence(:title) { |n| "Info document #{n}" }
    description { "A short public guide or fact sheet." }
    topic_list { %w[cost] }
    published_at { nil }

    trait :with_file do
      after(:build) do |document|
        document.document_file ||=
          build(:info_document_file, info_document: document)
      end
    end

    trait :published do
      with_file
      published_at { Time.current }
    end
  end

  factory :info_document_file do
    association :info_document
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 1.kilobyte,
          "filename" => "guide.pdf",
          "mime_type" => "application/pdf"
        }
      }
    end
    scan_status { "clean" }
  end
end
