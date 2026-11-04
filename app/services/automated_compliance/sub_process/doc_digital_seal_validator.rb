class AutomatedCompliance::SubProcess::DocDigitalSealValidator < AutomatedCompliance::Base
  def call(supporting_document)
    raise ArgumentError, "Invalid document" if supporting_document.blank?

    uploaded_file = supporting_document.file
    validated_file_id = uploaded_file&.id
    data =
      begin
        response =
          uploaded_file.open do
            Wrappers::DigitalSealValidator.new.call(
              uploaded_file.download,
              uploaded_file.mime_type
            )
          end
        if response.success || response.error.to_s == "UNSIGNED"
          {
            status: "success",
            result: DigitalSealSignatureFilter.call(response.signatures)
          }
        else
          { status: "failed", error: "Unable to run digital seal validation" }
        end
      rescue StandardError
        # Storage/validator failures are recorded outcomes. Database writes below
        # must still raise so an unpersisted outcome cannot unlock submission.
        { status: "failed", error: "Unable to run digital seal validation" }
      end

    supporting_document.with_lock do
      # Promotion changes the path but preserves the original upload ID.
      unless DigitalSealChecks.same_file?(
               validated_file_id,
               supporting_document.file_id
             )
        return false
      end
      supporting_document.update!(
        compliance_data: data.merge(file_id: validated_file_id)
      )
    end
  end
end
