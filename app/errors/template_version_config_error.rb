class TemplateVersionConfigError < StandardError
  attr_reader :config_errors

  def initialize(config_errors)
    # Keep accepting a plain message for callers/tests that only need the error
    # type; validator failures carry structured errors for the repair UI.
    unless config_errors.is_a?(Array)
      @config_errors = []
      return super(config_errors)
    end

    @config_errors = config_errors
    super(
      "Template configuration is invalid: #{config_errors.map { |error| summary(error) }.join("; ")}"
    )
  end

  private

  def summary(error)
    location = "Block #{error[:block_name].inspect}"
    if error[:requirement_name].present?
      location += ", field #{error[:requirement_name].inspect}"
    end
    "#{location}: #{error[:message]}"
  end
end
