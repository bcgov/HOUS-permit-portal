FactoryBot.define do
  factory :design_document do
    association :pre_check, factory: :pre_check

    after(:build) do |document|
      # Create a test file for Shrine upload
      file =
        Rack::Test::UploadedFile.new(
          StringIO.new("test pdf content"),
          "application/pdf",
          original_filename: "sample_drawing.pdf"
        )

      document.file = file
    end
  end
end
