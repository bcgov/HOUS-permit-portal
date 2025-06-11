FactoryBot.define do
  factory :step_code_occupancy, class: Part3StepCode::OccupancyClassification do
    occupancy_type { :step_code }
    key { :hotel_motel }
    energy_step_required { 3 }
    zero_carbon_step_required { 1 }
    modelled_floor_area { 1000 }
    performance_requirement { nil }

    trait :other_residential do
      key { :residential }
      energy_step_required { 3 }
      zero_carbon_step_required { 4 }
    end

    trait :low_industrial do
      occupancy_type { :baseline }
      key { :low_hazard_industrial }
      performance_requirement { :necb }
      energy_step_required { nil }
      zero_carbon_step_required { nil }
    end
  end
end
