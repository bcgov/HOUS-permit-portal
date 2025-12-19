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
    # [OVERHEATING REVIEW] Mini-lesson: use our existing search infrastructure (don’t hand-roll lists).
    # This endpoint should follow the same pattern as Jurisdictions:
    # - `Api::JurisdictionsController#index` + `Api::Concerns::Search::Jurisdictions`
    #   (see `app/controllers/api/jurisdictions_controller.rb` and `app/controllers/api/concerns/search/jurisdictions.rb`)
    # That gives you consistent query/sort/pagination + `meta: page_meta(@search)` in the response,
    # and keeps the frontend “search store” pattern working as-designed.
    render_success @pdf_forms, nil, { blueprint: PdfFormBlueprint }
  end

  def generate_pdf
    OverheatingReportGenerationJob.perform_async(@pdf_form.id)
    # [OVERHEATING REVIEW] Mini-lesson: async workflows should communicate state.
    # This just enqueues a job and returns the current record. Consider returning an explicit
    # “queued” indicator (or updating a status field) so the UI can show “generating…” reliably.
    render_success @pdf_form, nil, { blueprint: PdfFormBlueprint }
  end

  def download
    # [OVERHEATING REVIEW] This action re-authorizes, but `set_pdf_form` already calls `authorize @pdf_form`
    # using the current action name (`download?`). Redundant authorizations can be confusing—prefer one path.
    authorize @pdf_form, :download?
    if @pdf_form.pdf_file
      begin
        # [OVERHEATING REVIEW] This whole action likely shouldn’t exist.
        # We already have a centralized, consistent download endpoint:
        # - `Api::StorageController#download` -> presigned URL
        # - `FileDownloadButton` -> `downloadFileFromStorage` on the frontend
        # This controller action duplicates the behavior and streams bytes through Rails (memory-heavy).
        #
        # If you remove this route, ensure authorization is correct on the StorageController path:
        # it calls `authorize @record`, so PdfForm needs a correct `PdfFormPolicy#download?`
        # (see how `SupportingDocumentPolicy#download?` handles ownership + staff membership).
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
    # [OVERHEATING REVIEW] Mini-lesson: this `authorize` call will invoke the policy method matching
    # the current action (`update?`, `archive?`, `download?`, etc.). Keeping auth in one place like this
    # is good—just avoid re-authorizing in individual actions unless needed for clarity.
    #
    # Your lead’s note: multiple authorizations must go. Pick one pattern and stick with it.
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
