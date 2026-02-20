FactoryBot.define do
  factory :report_document do
    association :step_code
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 456,
          "filename" => "report.pdf",
          "mime_type" => "application/pdf"
        }
      }
    end
    scan_status { "pending" }
  end
end
