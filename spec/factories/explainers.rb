FactoryBot.define do
  factory :explainer do
    requirement_template
    introduction_html { "" }
    before_you_apply_html { "" }
    steps { [] }
    links { [] }
    published_at { nil }

    trait :published do
      introduction_html { "<p>When you need this permit</p>" }
      published_at { Time.current }
    end
  end
end
