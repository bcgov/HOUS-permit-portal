FactoryBot.define do
  factory :jurisdiction_template_version_customization do
    customizations { "{}" }
    association :jurisdiction, factory: :sub_district
    association :template_version
    sandboxed { false }
  end
end
