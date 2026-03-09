class Part3OccupancyRequiredStepBlueprint < Blueprinter::Base
  identifier :id

  fields :occupancy_key, :energy_step_required, :zero_carbon_step_required
end
