FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    transient do
      jurisdiction { nil }
      pid { nil }
      pin { nil }
      full_address { nil }
    end

    permit_project do
      attrs = {}
      attrs[:jurisdiction] = jurisdiction if jurisdiction.present?
      attrs[:pid] = pid if pid.present?
      attrs[:pin] = pin if pin.present?
      attrs[:full_address] = full_address if full_address.present?
      association(:permit_project, **attrs)
    end

    permit_type do
      PermitType.first || association(:permit_type, code: :low_residential)
    end
    activity do
      Activity.first || association(:activity, code: :new_construction)
    end
    status { :new_draft }
    sequence(:nickname) { |n| "Permit Application Nickname #{n}" }
    association :template_version

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
