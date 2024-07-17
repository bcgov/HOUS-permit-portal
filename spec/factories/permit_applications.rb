FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction, factory: :sub_district
    permit_type { PermitType.first || association(:permit_type, code: :low_residential) }
    activity { Activity.first || association(:activity, code: :new_construction) }
    status { :new_draft }
    sequence(:nickname) { |n| "Permit Application Nickname #{n}" }
    association :template_version
    pid { "999999999" }

    trait :newly_submitted do
      status { :newly_submitted }
      after(:create) do |permit_application|
        create(:submission_version, permit_application: permit_application)
        permit_application.reindex
      end
    end
  end
end
