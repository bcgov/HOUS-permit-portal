FactoryBot.define do
  factory :meeting_request_document do
    association :project_meeting
    document_type { :supporting }
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 123,
          "filename" => "site-plan.pdf",
          "mime_type" => "application/pdf"
        }
      }
    end
    scan_status { "pending" }

    trait :authorization do
      document_type { :authorization }
    end
  end
end
