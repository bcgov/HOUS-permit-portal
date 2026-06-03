FactoryBot.define do
  factory :template_category do
    sequence(:label) { |n| "Template Category #{n}" }
    sort_order { 0 }
  end
end
