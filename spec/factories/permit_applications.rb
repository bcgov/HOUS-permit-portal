FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction
    permit_type { PermitType.first || association(:permit_type, code: :low_residential) }
    activity { Activity.first || association(:activity, code: :new_construction) }
    status { :draft }
    sequence(:nickname) { |n| "Permit Application Nickname #{n}" }
    association :template_version
  end
end
