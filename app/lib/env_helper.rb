module EnvHelper
  module_function

  def integer_env(name, default_value)
    # NOTE: The 10 is a radix for the Integer constructor, not a default value.
    Integer(ENV.fetch(name, default_value), 10)
  rescue ArgumentError, TypeError
    default_value
  end

  def integer_list_env(name, default_value)
    raw_value = ENV[name]
    return default_value if raw_value.blank?

    parsed =
      raw_value
        .split(",")
        .map do |item|
          begin
            Integer(item.strip, 10)
          rescue StandardError
            nil
          end
        end
        .compact
        .uniq

    parsed.any? ? parsed : default_value
  end
end
