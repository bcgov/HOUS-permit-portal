class AutomatedCompliance::DigitalSealValidator < AutomatedCompliance::Base
  #responsible for taking a supporting document, assumes document has a compliance_data json field and a file uploader from shrine
  def call(supporting_document)
    raise ArgumentError.new("Invalid document") if supporting_document.blank?
    #stream down the supporting document
    uploaded_file = supporting_document.file
    uploaded_file.open do
      response = Integrations::DigitalSealValidator.new.call(uploaded_file.download, supporting_document.file.mime_type)
      if response.success
        supporting_document.update(compliance_data: { status: "success", result: response.signatures })
      else
        supporting_document.update(compliance_data: { status: "failed", error: response.error })
      end
      return
    end
    supporting_document.update(
      compliance_data: {
        status: "failed",
        error: "Unable to run digital seal validator integration",
      },
    )
  end
end
