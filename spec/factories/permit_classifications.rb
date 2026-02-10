FactoryBot.define do
  factory :permit_classification do
    sequence(:code) { |n| "permit_classification_#{n}" }
    sequence(:name) { |n| "Permit classification #{n}" }
    category { "planning_zoning" }
    description_html { "<p>Some description</p>" }
    enabled { true }
    type { "PermitClassification" }
  end
end
