FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction
    permit_type { PermitType.first || association(:permit_type) }
    activity { Activity.first || association(:activity) }
  end
end
