class AutomatedCompliance::DigitalSealValidatorJob
  include Sidekiq::Worker
  sidekiq_options queue: :default, lock: :until_and_while_executing

  def perform(permit_application_id)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?

    #if supporting document has compliance run validation on it
    fields_for_digital_check = permit_application.automated_compliance_requirements_for_module("DigitalSealValidator")
    supporting_doc_ids =
      permit_application.fetch_file_ids_from_submission_data_matching_requirements(fields_for_digital_check)
    regex_pattern = "(#{supporting_doc_ids.join("|")})$"
    supporting_docs_to_check = permit_application.supporting_documents_without_compliance_matching(regex_pattern)

    supporting_docs_to_check.each do |supporting_document|
      AutomatedCompliance::DigitalSealValidator.new.call(supporting_document)
    end
  end
end
