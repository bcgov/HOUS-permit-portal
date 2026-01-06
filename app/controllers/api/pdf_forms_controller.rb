class Api::PdfFormsController < Api::ApplicationController
  include Api::Concerns::Search::PdfForms
  before_action :set_pdf_form, only: %i[generate_pdf update archive]
  skip_after_action :verify_policy_scoped, only: %i[index]

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
    perform_search
    render_success @search.results,
                   nil,
                   { blueprint: PdfFormBlueprint, meta: page_meta(@search) }
  end

  def generate_pdf
    authorize @pdf_form
    @pdf_form.schedule_pdf_generation!
    render_success @pdf_form,
                   "pdf_form.generate_queued",
                   { blueprint: PdfFormBlueprint }
  end

  def update
    authorize @pdf_form
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
    authorize @pdf_form
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
  end

  def pdf_form_params
    p = params.require(:pdf_form)
    permitted =
      p.permit(
        :form_type,
        :status,
        :project_number,
        :model,
        :site,
        :lot,
        :address,
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
