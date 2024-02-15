class StepCode::ZeroCarbon::ComplianceBlueprint < Blueprinter::Base
  transform StepCode::ZeroCarbon::CO2Transformer
  transform StepCode::ZeroCarbon::GHGTransformer
  transform StepCode::ZeroCarbon::PrescriptiveTransformer
  transform RoundDecimalsTransformer

  field :proposed_zero_carbon_step do |compliance, _options|
    "EL#{compliance.step}"
  end

  field :required_zero_carbon_step do |compliance, _options|
    "EL#{compliance.min_required_step}"
  end
end
