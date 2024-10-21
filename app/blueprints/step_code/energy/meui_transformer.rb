class StepCode::Energy::MEUITransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Energy::MEUIBlueprint.render_as_hash(object.meui_checker)
    )
  end
end
