module ChecklistReportDocumentConcern
  extend ActiveSupport::Concern

  included do
    after_update :generate_report_document,
                 if: :should_generate_report_document?
  end

  def generate_report_document
    StepCodeReportGenerationJob.perform_async(
      respond_to?(:step_code) ? step_code.id : id
    )
  end

  def should_generate_report_document?
    complete? && !permit_application_id.present? && saved_changes?
  end
end
