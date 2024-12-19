class StepCode::Part3::StepCodeOccupancyBlueprint < Blueprinter::Base
  identifier :id

  fields :key,
         :modelled_floor_area,
         :energy_step_required,
         :zero_carbon_step_required,
         :requirement_source
end
