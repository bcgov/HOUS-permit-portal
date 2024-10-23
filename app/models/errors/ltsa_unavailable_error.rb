class Errors::LtsaUnavailableError < StandardError
  def initialize(msg = "land title service unavailable")
    super
  end
end
