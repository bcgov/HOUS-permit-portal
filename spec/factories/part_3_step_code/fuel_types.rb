FactoryBot.define do
  factory :fuel_type, class: Part3StepCode::FuelType do
    association :checklist, factory: :part_3_checklist
    key { :electricity }
    emissions_factor { 0.011 }

    trait :electricity do
      key { :electricity }
      emissions_factor { 0.011 }
    end

    trait :natural_gas do
      key { :natural_gas }
      emissions_factor { 0.180 }
    end

    trait :district_energy do
      key { :district_energy }
      emissions_factor { 0.050 }
    end
  end
end
