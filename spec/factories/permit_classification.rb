FactoryBot.define do
  factory :activity, class: "Activity" do
    sequence(:name) { |n| "Activity Name #{n}" }
    sequence(:code) { |n| "activity_code_#{n}" }
  end

  factory :permit_type, class: "PermitType" do
    sequence(:name) { |n| "Permit Type Name #{n}" }
    sequence(:code) { |n| "permit_type_code_#{n}" }
  end
end
