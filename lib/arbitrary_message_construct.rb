class ArbitraryMessageConstruct
  def self.message(key:, type:, options: {})
    translated_message(key, options).merge(type: type)
  end

  private

  def self.translated_message(key, options = {})
    message_from_copy = I18n.t("arbitrary_message_construct.#{key}")
    injected_message_details =
      message_from_copy.inject({}) do |result, (key, value)|
        result[key] = value % options
        result
      end
    injected_message_details
  end
end
