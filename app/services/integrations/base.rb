class Integrations::Base
  def call(*args)
    #this should return either a success or error with additional details that match the value expected
    raise "To implement the extraction logic"
  end
end
