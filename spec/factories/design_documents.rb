FactoryBot.define do
  factory :design_document do
    association :pre_check, factory: :pre_check

    after(:build) do |document|
      # Attach a sample file for testing
      document.file = {
        id: SecureRandom.hex(10),
        storage: "cache",
        metadata: {
          size: 1024,
          filename: "sample_drawing.pdf",
          mime_type: "application/pdf"
        }
      }
    end
  end
end
