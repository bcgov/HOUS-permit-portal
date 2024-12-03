class StepCode::Part9::ZeroCarbon::PrescriptiveTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Part9::ZeroCarbon::PrescriptiveBlueprint.render_as_hash(
        object.prescriptive_checker
      )
    )
  end
end
