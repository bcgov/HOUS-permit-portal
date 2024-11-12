FactoryBot.define do
  factory :energy_output, class: Part3StepCode::EnergyOutput do
    fuel_type
    annual_energy { rand(100..999) }

    trait :modelled do
      source { :modelled }
    end

    trait :reference do
      source { :reference }
    end
  end
end
