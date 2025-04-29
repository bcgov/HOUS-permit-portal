FactoryBot.define do
  factory :make_up_air_fuel, class: Part3StepCode::MakeUpAirFuel do
    trait :electricity do
      association :fuel_type, :electricity
    end
  end
end
