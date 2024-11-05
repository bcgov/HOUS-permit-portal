FactoryBot.define do
  factory :step_code_occupancy, class: Part3StepCode::OccupancyClassification do
    occupancy_type { :step_code }
    name { "Group C - Hotel and Motel" }
    energy_step_required { :step_3 }
    zero_carbon_step_required { :el_1 }
    modelled_floor_area { 1000 }
    performance_requirement { nil }

    trait :other_residential do
      name { "Group C - Other Residential" }
      energy_step_required { :step_3 }
      zero_carbon_step_required { :el_4 }
    end

    trait :low_industrial do
      name { "Group F3 - Low-Hazard Industrial" }
      performance_requirement { :necb }
      zero_carbon_step_required { nil }
      occupancy_type { :reference_building }
    end
  end
end
