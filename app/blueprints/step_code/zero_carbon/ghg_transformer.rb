class StepCode::ZeroCarbon::GHGTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::ZeroCarbon::GHGBlueprint.render_as_hash(object.ghg_checker)
    )
  end
end
