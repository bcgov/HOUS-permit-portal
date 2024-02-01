FactoryBot.define do
  factory :supporting_document do
    association :permit_application
    file_data { TestData.file_data }
  end
end
