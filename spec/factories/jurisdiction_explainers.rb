FactoryBot.define do
  factory :jurisdiction_explainer do
    association :jurisdiction, factory: :sub_district
    association :requirement_template
    local_context_html { "" }

    trait :filled do
      local_context_html { "<p>Book a pre-application meeting first</p>" }
    end
  end
end
