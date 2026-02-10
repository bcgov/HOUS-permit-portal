FactoryBot.define do
  factory :resource do
    association :jurisdiction, factory: :sub_district
    category { :planning_zoning }
    sequence(:title) { |n| "Resource #{n}" }
    resource_type { :link }
    link_url { "https://example.com/resource" }
    description { "A useful resource" }
  end
end
