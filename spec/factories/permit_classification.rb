FactoryBot.define do
  factory :activity, class: "Activity" do
    name { "Default Activity Name" }
    code { "default_activity_code" }
  end

  factory :permit_type, class: "PermitType" do
    name { "Default Permit Type Name" }
    code { "default_permit_type_code" }
  end
end
