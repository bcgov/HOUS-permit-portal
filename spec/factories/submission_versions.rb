FactoryBot.define do
  factory :submission_version do
    form_json { {} }
    submission_data { {} }
    viewed_at { nil }
    created_at { Time.current }
    updated_at { Time.current }
    association :permit_application

    trait :with_report_snapshot do
      form_json { { "components" => [] } }
      before(:create) do |version|
        version.id ||= SecureRandom.uuid
        version.created_at ||= Time.current
        version.report_snapshot = PrintReports::Snapshot.capture(version)
      end
    end

    trait :viewed do
      viewed_at { Time.current }
    end
  end
end
