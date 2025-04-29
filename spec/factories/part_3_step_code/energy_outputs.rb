FactoryBot.define do
  factory :energy_output, class: Part3StepCode::EnergyOutput do
    association :checklist, factory: :part_3_checklist
    association :fuel_type
    source { :modelled }
    use_type { :interior_lighting }
    annual_energy { rand(100..999) }
    name { nil }

    trait :other do
      use_type { :other }
      sequence(:name) { |n| "Custom Output #{n}" }
    end

    trait :modelled do
      source { :modelled }
    end

    trait :reference do
      source { :reference }
    end
  end
end
