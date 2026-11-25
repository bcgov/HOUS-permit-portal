module ChecklistReportDocumentConcern
  extend ActiveSupport::Concern

  included do
    after_update :generate_report_document,
                 if: :should_generate_report_document?
    after_update :mark_step_code_reports_stale, if: :should_mark_reports_stale?
  end

  def mark_step_code_reports_stale
    doc = stale_target_report_document
    return if doc.blank? || doc.stale?

    doc.update!(stale: true)
  end

  def should_mark_reports_stale?
    respond_to?(:step_code) && saved_changes? && !completing_checklist? &&
      stale_target_report_document.present?
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

  private

  def completing_checklist?
    saved_change_to_status? && complete?
  end

  def stale_target_report_document
    return unless respond_to?(:report_document)

    # Creating the report from the child side can cache has_one as nil on this
    # same in-memory checklist. Reset that empty target before reading.
    assoc = association(:report_document)
    assoc.reset if assoc.loaded? && assoc.target.nil?
    report_document
  end
end
