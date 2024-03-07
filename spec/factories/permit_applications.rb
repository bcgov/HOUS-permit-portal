FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction
    permit_type { PermitType.first || association(:permit_type) }
    activity { Activity.first || association(:activity) }
    status { :draft }
    sequence(:nickname) { |n| "Permit Application Nickname #{n}" }
    association :template_version
  end
end
