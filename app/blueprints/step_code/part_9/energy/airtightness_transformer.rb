class StepCode::Part9::Energy::AirtightnessTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Part9::Energy::AirtightnessBlueprint.render_as_hash(
        object.airtightness_checker
      )
    )
  end
end
