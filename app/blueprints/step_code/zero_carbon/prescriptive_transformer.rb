class StepCode::ZeroCarbon::PrescriptiveTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::ZeroCarbon::PrescriptiveBlueprint.render_as_hash(
        object.prescriptive_checker
      )
    )
  end
end
