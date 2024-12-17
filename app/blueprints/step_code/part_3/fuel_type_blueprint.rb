class StepCode::Part3::FuelTypeBlueprint < Blueprinter::Base
  identifier :id

  fields :key, :description, :emissions_factor, :source
end
