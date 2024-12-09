class StepCode::Part3::EnergyOutputBlueprint < Blueprinter::Base
  identifier :id

  fields :use_type, :name, :annual_energy, :source

  association :fuel_type, blueprint: StepCode::Part3::FuelTypeBlueprint
end
