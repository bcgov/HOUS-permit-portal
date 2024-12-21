class StepCode::Part9::Energy::MEUITransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Part9::Energy::MEUIBlueprint.render_as_hash(object.meui_checker)
    )
  end
end
