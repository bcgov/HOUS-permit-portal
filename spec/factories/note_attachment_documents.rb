FactoryBot.define do
  factory :note_attachment_document do
    association :note
    file_data { TestData.file_data }
    scan_status { "clean" }
  end
end
