class AutomatedCompliance::DigitalSealValidatorJob < ApplicationJob
  queue_as :default

  def perform(permit_application)
    #if supporting document has compliance run validation on it
    fields_for_digital_check = permit_application.automated_compliance_requirements_for_module("DigitalSealValidator")
    supporting_doc_ids =
      fields_for_digital_check.map { |field_id, req| submission_data.dig("data", field_id, "id") }.compact
    supporting_docs_to_check =
      permit_application
        .supporting_documents
        .where(id: supporting_doc_ids)
        .where("compliance_data = '{}' OR compliance_data is NULL")
    supporting_docs_to_check.each do |supporting_document|
      AutomatedCompliance::DigitalSealValidator.new.call(supporting_document)
    end
  end
end
