module ChecklistReportDocumentConcern
  extend ActiveSupport::Concern

  included do
    after_update :generate_report_document,
                 if: :should_generate_report_document?
    after_update :mark_step_code_reports_stale, if: :should_mark_reports_stale?
  end

  def mark_step_code_reports_stale
    step_code
      .report_documents
      .where(stale: false)
      .update_all(stale: true, updated_at: Time.current)
  end

  def should_mark_reports_stale?
    respond_to?(:step_code) && step_code.present? &&
      step_code.report_documents.exists? && saved_changes?
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
    # Child checklists enqueue report generation explicitly via
    # report_generation_requested; avoid regenerating on every edit after summary completion.
    return false if respond_to?(:step_code)

    complete? && !permit_application_id.present? && saved_changes?
  end
end
