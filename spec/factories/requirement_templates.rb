FactoryBot.define do
  factory :requirement_template do
    association :activity, factory: :activity
    association :permit_type, factory: :permit_type

    # Add additional attributes for RequirementTemplate here if needed
  end
end
