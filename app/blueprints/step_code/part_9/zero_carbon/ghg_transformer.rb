class StepCode::Part9::ZeroCarbon::GHGTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Part9::ZeroCarbon::GHGBlueprint.render_as_hash(
        object.ghg_checker
      )
    )
  end
end
