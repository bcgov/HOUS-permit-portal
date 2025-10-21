FactoryBot.define do
  factory :pre_check do
    association :creator, factory: :user
    association :jurisdiction, factory: :sub_district
    association :permit_type, factory: :permit_type
    permit_application { association :permit_application, submitter: creator }
    full_address { "123 Test St" }
    certificate_no { "CERT-#{SecureRandom.hex(4)}" }
    status { "draft" }
    service_partner { :archistar }
    eula_accepted { true }
    consent_to_send_drawings { true }
    consent_to_share_with_jurisdiction { false }
    consent_to_research_contact { false }

    trait :with_design_documents do
      after(:create) do |pre_check|
        create(:design_document, pre_check: pre_check)
      end
    end

    trait :processing do
      with_design_documents
      submitted_at { Time.current }

      after(:create) do |pre_check|
        # Bypass validations to set status directly for test setup
        pre_check.update_column(:status, PreCheck.statuses[:processing])
      end
    end

    trait :complete do
      processing
      completed_at { Time.current }
      assessment_result { :passed }
      result_message { "All sections have passed." }

      after(:create) do |pre_check|
        pre_check.update_column(:status, PreCheck.statuses[:complete])
      end
    end
  end
end
