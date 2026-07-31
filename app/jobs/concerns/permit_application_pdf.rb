# frozen_string_literal: true

# Builds signed print URLs and renders permit-application PDFs via HtmlPdfService.
module PermitApplicationPdf
  extend ActiveSupport::Concern

  def render_permit_application_pdf_bytes(
    permit_application:,
    submission_version: nil
  )
    path =
      build_permit_application_print_path(
        permit_application: permit_application,
        submission_version: submission_version
      )
    HtmlPdfService.new.convert_path(path)
  end

  def build_permit_application_print_path(
    permit_application:,
    submission_version: nil
  )
    token =
      PrintTokenService.generate(
        {
          permit_application_id: permit_application.id,
          submission_version_id: submission_version&.id
        }
      )

    "/permit-applications/#{permit_application.id}/print?print_token=#{CGI.escape(token)}"
  end

  def attach_permit_application_pdf_to_submission_version!(
    submission_version:,
    permit_application:,
    filename:
  )
    pdf_bytes =
      render_permit_application_pdf_bytes(
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
              data_key: PermitApplication::PERMIT_APP_PDF_DATA_KEY
            )
            .first_or_initialize

        doc.update(file:) if doc.file.blank?
      end
  end
end
