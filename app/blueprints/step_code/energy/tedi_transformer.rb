class StepCode::Energy::TEDITransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Energy::TEDIBlueprint.render_as_hash(object.tedi_checker)
    )
  end
end
