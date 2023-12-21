FactoryBot.define do
  factory :work_type do
    trait :new_construction do
      name { "New Construction" }
    end

    trait :addition_alteration_renovation do
      name { "Addition / Alteration / Renovation" }
    end

    trait :site_alterations_landscaping do
      name { "Site Alterations / Landscaping" }
    end

    trait :demolition_of_existing_buildings do
      name { "Demolition of Existing Buildings" }
    end
  end
end
