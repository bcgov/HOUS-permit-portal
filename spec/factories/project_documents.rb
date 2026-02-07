FactoryBot.define do
  factory :project_document do
    association :permit_project
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 123,
          "filename" => "project.pdf",
          "mime_type" => "application/pdf"
        }
      }
    end
    scan_status { "pending" }
  end
end
