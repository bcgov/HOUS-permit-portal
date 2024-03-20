FactoryBot.define do
  factory :activity, class: "Activity" do
    sequence(:name) { |n| "Activity Name #{n}" }
    code { :low_residential }
  end

  factory :permit_type, class: "PermitType" do
    sequence(:name) { |n| "Permit Type Name #{n}" }
    code { :new_construction }
  end
end
