module ChecklistReportDocumentConcern
  extend ActiveSupport::Concern

  included do
    after_update :generate_report_document,
                 if: :should_generate_report_document?
  end

  def generate_report_document
    if respond_to?(:step_code)
      StepCodeReportGenerationJob.perform_async(
        step_code.id,
        { "checklist_id" => id }
      )
    else
      StepCodeReportGenerationJob.perform_async(id)
    end
  end

  def should_generate_report_document?
    complete? && (!respond_to?(:step_code) || step_code.present?) &&
      !permit_application_id.present? && saved_changes?
  end
end
