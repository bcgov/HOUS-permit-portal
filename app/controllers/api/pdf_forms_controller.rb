class Api::PdfFormsController < Api::ApplicationController
  before_action :set_pdf_form, only: %i[generate_pdf download update archive]

  def create
    @pdf_form = PdfForm.new(pdf_form_params.merge(user_id: current_user.id))

    authorize @pdf_form

    if @pdf_form.save
      render_success @pdf_form,
                     "pdf_form.create_success",
                     { blueprint: PdfFormBlueprint, status: :created }
    else
      render_error "pdf_form.create_error",
                   {
                     message_opts: {
                       error_message: @pdf_form.errors.full_messages.join(", ")
                     },
                     status: 422
                   }
    end
  end

  def index
    @pdf_forms = policy_scope(PdfForm).order(created_at: :desc)
    render_success @pdf_forms, nil, { blueprint: PdfFormBlueprint }
  end

  def generate_pdf
    OverheatingReportGenerationJob.perform_async(@pdf_form.id)
    render_success @pdf_form, nil, { blueprint: PdfFormBlueprint }
  end

  def download
    authorize @pdf_form, :download?
    if @pdf_form.pdf_file
      begin
        send_data @pdf_form.pdf_file.read,
                  filename: "pdf_form_#{@pdf_form.id}.pdf",
                  type: "application/pdf",
                  disposition: "attachment"
      rescue => e
        render_error "pdf_form.read_error",
                     {
                       message_opts: {
                         error_message: "Error reading PDF file: #{e.message}"
                       },
                       status: 500
                     }
      end
    else
      render_error "pdf_form.file_not_found",
                   {
                     message_opts: {
                       error_message:
                         "PDF file not found. Please generate the PDF first and wait for generation to complete."
                     },
                     status: 404
                   }
    end
  end

  def update
    if @pdf_form.update(pdf_form_params)
      render_success @pdf_form, nil, { blueprint: PdfFormBlueprint }
    else
      render_error "pdf_form.update_error",
                   {
                     message_opts: {
                       error_message: @pdf_form.errors.full_messages.join(", ")
                     },
                     status: 422
                   }
    end
  end

  def archive
    if @pdf_form.update(status: false)
      render_success @pdf_form, nil, { blueprint: PdfFormBlueprint }
    else
      render_error "pdf_form.archive_error",
                   {
                     message_opts: {
                       error_message: @pdf_form.errors.full_messages.join(", ")
                     },
                     status: 422
                   }
    end
  end

  private

  def set_pdf_form
    @pdf_form = PdfForm.find(params[:id])
    authorize @pdf_form
  end

  def pdf_form_params
    p = params.require(:pdf_form)
    permitted =
      p.permit(
        :form_type,
        :status,
        overheating_documents_attributes: [
          :id,
          :_destroy,
          file: [:id, :storage, metadata: %i[size filename mime_type]]
        ]
      )
    permitted[:form_json] = p[:form_json].permit! if p[:form_json].respond_to?(
      :permit!
    )
    permitted
  end
end
