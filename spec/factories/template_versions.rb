FactoryBot.define do
  factory :template_version do
    denormalized_template_json { "{}" }
    form_json { "{}" }
    requirement_blocks_json { "{}" }
    version_diff { "{}" }
    version_date { "2024-02-15" }
    status { 0 }
    requirement_template { RequirementTemplate.first || association(:requirement_template) }
  end
end
