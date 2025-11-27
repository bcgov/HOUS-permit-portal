FactoryBot.define do
  factory :activity, class: "Activity" do
    sequence(:name) { |n| "Activity Name #{n}" }
    code { "low_residential_#{SecureRandom.alphanumeric(8)}".to_sym }
  end

  factory :permit_type, class: "PermitType" do
    sequence(:name) { |n| "Permit Type Name #{n}" }
    code { "new_construction_#{SecureRandom.alphanumeric(8)}".to_sym }
  end
end
