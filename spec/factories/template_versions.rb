FactoryBot.define do
  factory :template_version do
    denormalized_template_json { {} }
    form_json { {} }
    requirement_blocks_json { {} }
    version_diff { {} }
    version_date { "2024-02-15" }
    status { 1 }
    requirement_template do
      LiveRequirementTemplate.first || association(:live_requirement_template)
    end
  end
end
