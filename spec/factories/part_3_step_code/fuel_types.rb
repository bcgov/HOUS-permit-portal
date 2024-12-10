FactoryBot.define do
  factory :fuel_type, class: Part3StepCode::FuelType do
    trait :electricity do
      emissions_factor { 0.011 }
      name { "electricity" }
    end

    trait :natural_gas do
      emissions_factor { 0.180 }
      name { "natural_gas" }
    end

    trait :district_energy do
      emissions_factor { 0.050 }
      name { "district_energy" }
    end
  end
end
