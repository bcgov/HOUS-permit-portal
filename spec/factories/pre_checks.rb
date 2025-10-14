FactoryBot.define do
  factory :pre_check do
    association :creator, factory: :user
    association :jurisdiction, factory: :jurisdiction
    association :permit_type, factory: :permit_type
    permit_application { association :permit_application, submitter: creator }
    full_address { "123 Test St" }
    cert_number { "CERT-#{SecureRandom.hex(4)}" }
    phase { "draft" }
    service_partner { :archistar }
    eula_accepted { true }
    consent_to_send_drawings { true }
    consent_to_share_with_jurisdiction { false }
    consent_to_research_contact { false }
  end
end
