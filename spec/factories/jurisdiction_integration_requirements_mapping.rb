FactoryBot.define do
  factory :jurisdiction_integration_requirements_mapping do
    requirements_mapping { {} }
    association :jurisdiction, factory: :sub_district
    association :template_version
  end
end
