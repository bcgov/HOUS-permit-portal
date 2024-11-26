FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction, factory: :sub_district
    permit_type do
      PermitType.first || association(:permit_type, code: :low_residential)
    end
    activity do
      Activity.first || association(:activity, code: :new_construction)
    end
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

    trait :revisions_requested do
      status { :revisions_requested }
      after(:create) do |permit_application|
        submission_version =
          create(:submission_version, permit_application: permit_application)
        create(:revision_request, submission_version: submission_version)
        permit_application.reindex
      end
    end

    trait :resubmitted do
      status { :resubmitted }
      after(:create) do |permit_application|
        viewed_submission_version =
          create(
            :submission_version,
            :viewed,
            permit_application: permit_application
          )
        create(:revision_request, submission_version: viewed_submission_version)
        create(:submission_version, permit_application: permit_application)
        permit_application.reindex
      end
    end
  end
end
