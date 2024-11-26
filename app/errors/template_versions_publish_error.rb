class TemplateVersionsPublishError < StandardError
  attr_reader :errors

  def initialize(errors)
    @errors = errors
    super(
      "Failed to publish some versions. See the errors attribute for details."
    )
  end
end
