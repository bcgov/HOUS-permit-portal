class StepCode::ZeroCarbon::ComplianceTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(StepCode::ZeroCarbon::ComplianceBlueprint.render_as_hash(object.zero_carbon_step_compliance))
  end
end
