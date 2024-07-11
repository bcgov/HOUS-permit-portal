class StepCode::ZeroCarbon::ComplianceBlueprint < Blueprinter::Base
  transform StepCode::ZeroCarbon::CO2Transformer
  transform StepCode::ZeroCarbon::GHGTransformer
  transform StepCode::ZeroCarbon::PrescriptiveTransformer
  transform RoundDecimalsTransformer

  field :proposed_step do |compliance, _options|
    compliance.step
  end

  field :required_step do |compliance, _options|
    compliance.min_required_step
  end

  field :min_required_step, name: :min_step
  field :max_step
end
