FactoryBot.define do
  factory :permit_project do
    association :owner, factory: :user
    association :jurisdiction, factory: :sub_district
    sequence(:title) { |n| "Permit Project Title #{n}" }
    full_address { "123 Main St, Anytown, USA" }
    pid { nil }
    pin { nil }
    # Add other attributes as necessary
  end
end
