FactoryBot.define do
  factory :jurisdiction_template_version_customization do
    customizations { "{}" }
    jurisdiction { nil }
    template_version { nil }
  end
end
