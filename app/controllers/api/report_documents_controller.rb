class Api::ReportDocumentsController < Api::ApplicationController
  before_action :set_report_document, only: %i[share_with_jurisdiction]

  # POST /api/report_documents/:id/share_with_jurisdiction
  # Shares the report with the jurisdiction associated with the step_code
  # Params:
  #   - email (optional): specific email address to send to (otherwise sends to all confirmed contacts)
  def share_with_jurisdiction
    authorize @report_document, :share?

    jurisdiction = @report_document.step_code.jurisdiction

    unless jurisdiction
      return(
        render_error(
          "report_document.no_jurisdiction",
          {
            status: :unprocessable_entity,
            log_args: {
              errors: ["Step code has no associated jurisdiction"],
              params: {
                report_document_id: @report_document.id
              }
            }
          }
        )
      )
    end

    service =
      StepCodeReportSharingService.new(
        report_document: @report_document,
        sender_user: current_user
      )

    success =
      if params[:email].present?
        service.send_to_email(params[:email], jurisdiction.id)
      else
        service.send_to_jurisdiction(jurisdiction.id)
      end

    if success
      render_success(
        { message: "Report successfully shared with jurisdiction" },
        "report_document.share_success",
        { message_opts: { jurisdiction_name: jurisdiction.qualified_name } }
      )
    else
      render_error(
        "report_document.share_error",
        {
          status: :unprocessable_entity,
          log_args: {
            errors: service.errors,
            params: {
              report_document_id: @report_document.id,
              jurisdiction_id: jurisdiction.id
            }
          },
          message_opts: {
            errors: service.errors.join(", ")
          }
        }
      )
    end
  end

  private

  def set_report_document
    @report_document = ReportDocument.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error(
      "report_document.not_found",
      {
        status: :not_found,
        log_args: {
          errors: ["Report document not found"],
          params: {
            id: params[:id]
          }
        }
      }
    )
  end
end
