class AutomatedCompliance::DigitalSealValidatorJob < ActiveJob::Base
  def perform(supporting_document)
    AutomatedCompliance::DigitalSealValidator.new.call(supporting_document)
  end
end
