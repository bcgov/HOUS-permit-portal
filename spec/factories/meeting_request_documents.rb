FactoryBot.define do
  factory :meeting_request_document do
    association :project_meeting
    document_type { :supporting }
    file_data { TestData.file_data }
    scan_status { "pending" }

    trait :authorization do
      document_type { :authorization }
    end
  end
end
