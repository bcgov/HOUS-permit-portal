FactoryBot.define do
  factory :resource_document do
    association :resource
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 321,
          "filename" => "resource.pdf",
          "mime_type" => "application/pdf"
        }
      }
    end
    scan_status { "pending" }
  end
end
