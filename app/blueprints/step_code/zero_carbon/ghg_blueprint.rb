class StepCode::ZeroCarbon::GHGBlueprint < Blueprinter::Base
  fields :total_ghg, :total_ghg_requirement

  field :ghg_passed do |checker, _options|
    checker.requirements_met?
  end
end
