FactoryBot.define do
  factory :permit_application do
    permit_type { 0 }
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction
  end
end
