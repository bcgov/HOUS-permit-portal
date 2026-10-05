FactoryBot.define do
  factory :meeting_request_document do
    association :project_meeting
    document_type { :supporting }
    scan_status { "pending" }

    # file_data is a text column. A Hash is stored with Ruby `=>` syntax, which
    # FileUploadAttachment#file_data cannot parse, so the download URL is nil.
    after(:create) do |document|
      document.update_column(:file_data, TestData.file_data.to_json)
    end

    trait :authorization do
      document_type { :authorization }
    end
  end
end
