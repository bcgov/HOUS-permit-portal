class AutomatedCompliance::DigitalSealValidator < AutomatedCompliance::Base
  def call(permit_application)
    DigitalSealChecks
      .new(permit_application)
      .pending_documents
      .map do |supporting_document|
        AutomatedCompliance::SubProcess::DocDigitalSealValidator.new.call(
          supporting_document
        )
      end
  end
end
