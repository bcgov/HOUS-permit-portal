class AutomatedCompliance::SubProcess::DocDigitalSealValidator < AutomatedCompliance::Base
  #responsible for taking a supporting document, assumes document has a compliance_data json field and a file uploader from shrine
  def call(supporting_document)
    raise ArgumentError.new("Invalid document") if supporting_document.blank?
    #stream down the supporting document
    uploaded_file = supporting_document.file
    uploaded_file.open do
      response =
        Wrappers::DigitalSealValidator.new.call(
          uploaded_file.download,
          uploaded_file.mime_type
        )
      # Match standalone tool: UNSIGNED / no approved seals => empty success result (not found),
      # not a system failure. Filter to AIBC/EGBC the same way as the standalone API.
      if response.success || response.error.to_s == "UNSIGNED"
        return(
          supporting_document.update(
            compliance_data: {
              status: "success",
              result: DigitalSealSignatureFilter.call(response.signatures)
            }
          )
        )
      else
        return(
          supporting_document.update(
            compliance_data: {
              status: "failed",
              error:
                "Unable to run digital seal validator integration - #{response.error}"
            }
          )
        )
      end
    end
    supporting_document.update(
      compliance_data: {
        status: "failed",
        error: "Unable to run digital seal validator integration"
      }
    )
    #special case
  end
end
