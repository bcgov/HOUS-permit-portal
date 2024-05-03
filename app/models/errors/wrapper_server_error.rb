class Errors::WrapperServerError < StandardError
  attr_reader :status

  def initialize(message, status)
    super(message)
    Rails.logger.error message
    @status = status
  end
end
