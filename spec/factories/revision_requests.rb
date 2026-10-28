FactoryBot.define do
  factory :revision_request, class: "FieldRevisionRequest" do
    reason_code { "default_reason_code" }
    requirement_json { { "id" => "requirement", "key" => "field" } }
    submission_data { {} }
    comment { "Default comment" }
    association :submission_version
    association :user, factory: %i[user reviewer]
    created_at { Time.current }
    updated_at { Time.current }
  end

  factory :supporting_document_revision_request,
          class: "SupportingDocumentRevisionRequest" do
    title { "Site photos" }
    comment { "Please upload the latest site photos." }
    association :submission_version
    association :user, factory: %i[user reviewer]
  end

  factory :revision_reference_document do
    association :revision_request,
                factory: :supporting_document_revision_request
    file_data { TestData.file_data }
    scan_status { "pending" }
  end
end
