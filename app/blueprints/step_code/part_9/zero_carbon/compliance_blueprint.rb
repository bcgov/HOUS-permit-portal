class StepCode::Part9::ZeroCarbon::ComplianceBlueprint < Blueprinter::Base
  transform StepCode::Part9::ZeroCarbon::CO2Transformer
  transform StepCode::Part9::ZeroCarbon::GHGTransformer
  transform StepCode::Part9::ZeroCarbon::PrescriptiveTransformer
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
