class StepCode::ZeroCarbon::CO2Transformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash.merge!(
      StepCode::ZeroCarbon::CO2Blueprint.render_as_hash(object.co2_checker)
    )
  end
end
