FactoryBot.define do
  factory :permit_application do
    association :submitter, factory: :user, role: "submitter"
    association :jurisdiction
  end
end
