FactoryBot.define do
  factory :step_code_occupancy, class: Part3StepCode::OccupancyClassification do
    occupancy_type { :step_code }
    name { "Group C - Hotel and Motel" }
    energy_step_required { :step_3 }
    zero_carbon_step_required { :el_1 }
    modelled_floor_area { 1000 }
  end
end
