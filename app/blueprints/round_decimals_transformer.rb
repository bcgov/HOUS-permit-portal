class RoundDecimalsTransformer < Blueprinter::Transformer
  def transform(hash, _object, _options)
    hash.transform_values! do |value|
      value.respond_to?(:round) ? value.round(2).to_s : value
    end
  end
end
