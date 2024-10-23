class AutomatedCompliance::DigitalSealValidator < AutomatedCompliance::Base
  def call(permit_application)
    #if supporting document has compliance run validation on it
    fields_for_digital_check =
      permit_application.automated_compliance_requirements_for_module(
        "DigitalSealValidator"
      )
    supporting_doc_ids =
      permit_application.fetch_file_ids_from_submission_data_matching_requirements(
        fields_for_digital_check
      )
    regex_pattern = "(#{supporting_doc_ids.join("|")})$"
    supporting_docs_to_check =
      permit_application.supporting_documents_without_compliance_matching(
        regex_pattern
      )

    #return list of field ids that were checked
    supporting_docs_to_check.map do |supporting_document|
      AutomatedCompliance::SubProcess::DocDigitalSealValidator.new.call(
        supporting_document
      )
    end
  end
end
