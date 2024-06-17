FactoryBot.define do
  factory :integration_mapping do
    requirements_mapping { {} }
    association :jurisdiction, factory: :sub_district
    association :template_version
  end
end
