class StepCode::Part3::BaselineOccupancyBlueprint < Blueprinter::Base
  identifier :id

  fields :key,
         :modelled_floor_area,
         :performance_requirement,
         :percent_better_requirement,
         :requirement_source
end
