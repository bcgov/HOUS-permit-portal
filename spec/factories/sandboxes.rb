FactoryBot.define do
  factory :sandbox do
    association :jurisdiction, factory: :sub_district
    sequence(:name) { |n| "Sandbox #{n}" }
  end
end
