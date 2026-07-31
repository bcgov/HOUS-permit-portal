require_relative "concerns/step_code_checklist_pdf"
require_relative "concerns/permit_application_pdf"

class PdfGenerationJob
  include Sidekiq::Worker
  include StepCodeChecklistPdf
  include PermitApplicationPdf

  sidekiq_options lock: :until_executed,
                  queue: :file_processing,
                  on_conflict: {
                    client: :reject,
                    server: :reject
                  }

  def self.lock_args(args)
    [args[0]]
  end

  def perform(permit_application_id)
    permit_application = PermitApplication.find(permit_application_id)
    return if permit_application.blank?

    permit_application
      .submission_versions
      .select(&:missing_pdfs?)
      .each do |submission_version|
        file_namer =
          PermitApplicationGeneratedFileNamer.new(
            permit_application,
            date: submission_version.created_at
          )

        if submission_version.missing_step_code_checklist_pdf?
          attach_checklist_pdf_to_submission_version!(
            submission_version: submission_version,
            permit_application: permit_application,
            filename:
              file_namer.step_code_checklist_pdf(
                version_number: submission_version.version_number
              )
          )
        end

        if submission_version.missing_permit_application_pdf?
          attach_permit_application_pdf_to_submission_version!(
            submission_version: submission_version,
            permit_application: permit_application,
            filename:
              file_namer.permit_application_pdf(
                version_number: submission_version.version_number
              )
          )
        end
      end
  end
end
