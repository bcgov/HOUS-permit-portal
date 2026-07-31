# frozen_string_literal: true

# Builds signed print URLs and renders checklist PDFs via HtmlPdfService (Gotenberg).
module StepCodeChecklistPdf
  extend ActiveSupport::Concern

  # @return [String] PDF bytes
  def render_checklist_pdf_bytes(
    step_code:,
    permit_application: nil,
    submission_version: nil,
    checklist: nil
  )
    path =
      build_checklist_print_path(
        step_code: step_code,
        permit_application: permit_application,
        submission_version: submission_version,
        checklist: checklist
      )
    HtmlPdfService.new.convert_path(path)
  end

  def build_checklist_print_path(
    step_code:,
    permit_application: nil,
    submission_version: nil,
    checklist: nil
  )
    token =
      PrintTokenService.generate(
        {
          step_code_id: step_code.id,
          permit_application_id: permit_application&.id,
          submission_version_id: submission_version&.id,
          checklist_id: checklist&.id
        }
      )

    if permit_application.present?
      "/permit-applications/#{permit_application.id}/step-code/print?print_token=#{CGI.escape(token)}"
    else
      prefix =
        (
          if step_code.is_a?(Part3StepCode)
            "part-3-step-code"
          else
            "part-9-step-code"
          end
        )
      "/#{prefix}/#{step_code.id}/print?print_token=#{CGI.escape(token)}"
    end
  end

  def attach_checklist_pdf_to_submission_version!(
    submission_version:,
    permit_application:,
    filename:
  )
    step_code = permit_application.step_code
    return unless step_code.present?
    return unless submission_version.has_step_code_checklist?

    pdf_bytes =
      render_checklist_pdf_bytes(
        step_code: step_code,
        permit_application: permit_application,
        submission_version: submission_version
      )

    HtmlPdfService
      .new
      .with_tempfile(pdf_bytes, filename: filename) do |file|
        doc =
          submission_version
            .supporting_documents
            .where(
              permit_application_id: permit_application.id,
              data_key: PermitApplication::CHECKLIST_PDF_DATA_KEY
            )
            .first_or_initialize

        doc.update(file:) if doc.file.blank?
      end
  end
end
