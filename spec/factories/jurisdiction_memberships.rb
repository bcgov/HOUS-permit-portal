FactoryBot.define do
  factory :jurisdiction_membership do
    association :user, factory: :user, role: "review_manager"
    association :jurisdiction, factory: :sub_district
  end
end
