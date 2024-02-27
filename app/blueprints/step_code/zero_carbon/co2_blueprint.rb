class StepCode::ZeroCarbon::CO2Blueprint < Blueprinter::Base
  fields :co2, :co2_requirement, :co2_max_requirement

  field :co2_passed do |checker, _options|
    checker.requirements_met?
  end
end
