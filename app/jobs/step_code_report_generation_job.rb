require "fileutils"
require_relative "concerns/step_code_checklist_pdf"

class StepCodeReportGenerationJob
  include Sidekiq::Worker
  include StepCodeChecklistPdf

  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    [args[0]]
  end

  def perform(step_code_id, options = {})
    options = (options || {}).with_indifferent_access
    step_code = StepCode.find_by(id: step_code_id)
    return if step_code.blank?

    checklist =
      if options[:checklist_id].present?
        step_code.checklist_for(id: options[:checklist_id])
      elsif options[:stage].present?
        step_code.checklist_for(stage: options[:stage])
      else
        step_code.current_checklist
      end

    if checklist.blank?
      Rails.logger.info(
        "Skipping StepCodeReportGenerationJob for #{step_code.id}: checklist not present for standalone StepCode."
      )
      return
    end

    output_filename =
      options["outputFilename"].presence ||
        "step_code_report_#{step_code.id}.pdf"

    pdf_bytes =
      render_checklist_pdf_bytes(step_code: step_code, checklist: checklist)

    HtmlPdfService
      .new
      .with_tempfile(pdf_bytes, filename: output_filename) do |file|
        report_doc = step_code.report_documents.build
        report_doc.file = file
        report_doc.save!

        NotificationService.publish_step_code_report_generated_event(report_doc)
      end
  end
end
