FactoryBot.define do
  factory :requirement_document do
    association :requirement_block
    file_data do
      {
        "id" => SecureRandom.uuid,
        "storage" => "cache",
        "metadata" => {
          "size" => 789,
          "filename" => "requirement.pdf",
          "mime_type" => "application/pdf"
        }
      }
    end
    scan_status { "pending" }
  end
end
