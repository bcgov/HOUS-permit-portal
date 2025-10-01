FactoryBot.define do
  factory :pre_check do
    association :creator, factory: :user
    permit_application
    title { "Pre-check title" }
    full_address { "123 Test St" }
    cert_number { "CERT-#{SecureRandom.hex(4)}" }
    phase { "draft" }
    checklist { { sections: [] } }
  end
end
