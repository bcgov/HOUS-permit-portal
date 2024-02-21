class Errors::FeatureAttributesRetrievalError < StandardError
  def initialize(msg = "Failed to retrieve feature attributes")
    super
  end
end
