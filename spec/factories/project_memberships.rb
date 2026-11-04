FactoryBot.define do
  factory :project_membership do
    association :permit_project
    association :user
    access { :standard }
    contact_designation { :none }
  end
end
