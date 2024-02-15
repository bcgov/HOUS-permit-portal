class StepCode::Energy::ComplianceTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(StepCode::Energy::ComplianceBlueprint.render_as_hash(object.energy_step_compliance))
  end
end
