class StepCode::Part9::Energy::TEDITransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Part9::Energy::TEDIBlueprint.render_as_hash(object.tedi_checker)
    )
  end
end
