class StepCode::Energy::AirtightnessTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::Energy::AirtightnessBlueprint.render_as_hash(
        object.airtightness_checker
      )
    )
  end
end
