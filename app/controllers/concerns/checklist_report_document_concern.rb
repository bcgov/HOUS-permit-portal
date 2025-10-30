module ChecklistReportDocumentConcern
  extend ActiveSupport::Concern

  included do
    after_update :generate_report_document,
                 if: :should_generate_report_document?
  end

  def generate_report_document
    StepCodeReportGenerationJob.perform_async(step_code.id)
  end

  def should_generate_report_document?
    complete? && !step_code.permit_application_id.present? && saved_changes?
  end
end
