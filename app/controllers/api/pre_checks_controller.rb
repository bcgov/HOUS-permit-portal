class Api::PreChecksController < Api::ApplicationController
  include Api::Concerns::Search::PreChecks

  before_action :set_pre_check,
                only: %i[show update submit mark_viewed pdf_report_url]
  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    perform_pre_check_search
    render_success @pre_check_search.results,
                   nil,
                   {
                     meta:
                       page_meta(@pre_check_search).merge(
                         unviewed_count:
                           PreCheck.unviewed_count_for_user(current_user.id)
                       ),
                     blueprint: PreCheckBlueprint
                   }
  end

  def show
    authorize @pre_check
    render_success @pre_check, nil, { blueprint: PreCheckBlueprint }
  end

  def create
    pre_check = PreCheck.new(pre_check_params.merge(creator: current_user))

    authorize pre_check
    if pre_check.save
      render_success pre_check,
                     "pre_check.create_success",
                     { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.create_error",
                   message_opts: {
                     error_message: pre_check.errors.full_messages.to_sentence,
                     log_args: {
                       errors: pre_check.errors.full_messages
                     }
                   }
    end
  end

  def update
    authorize @pre_check
    if @pre_check.update(pre_check_params)
      render_success @pre_check,
                     "pre_check.update_success",
                     { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.update_error",
                   message_opts: {
                     error_message: @pre_check.errors.full_messages.to_sentence
                   }
    end
  end

  def submit
    authorize @pre_check

    begin
      if @pre_check.submit
        render_success @pre_check,
                       "pre_check.submit_success",
                       { blueprint: PreCheckBlueprint }
      else
        render_error "pre_check.submit_error",
                     message_opts: {
                     },
                     log_args: {
                       errors: @pre_check.errors.full_messages
                     }
      end
    rescue => e
      # Handle wrapper/client errors (like Archistar 400 errors)
      Rails.logger.error("Pre-check submission failed: #{e.message}")
      render_error "pre_check.submit_error",
                   message_opts: {
                   },
                   log_args: {
                     errors: e.message
                   }
    end
  end

  def mark_viewed
    authorize @pre_check

    if @pre_check.update(viewed_at: Time.current)
      render_success @pre_check, nil, { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.update_error",
                   message_opts: {
                     error_message: @pre_check.errors.full_messages.to_sentence
                   }
    end
  end

  def pdf_report_url
    authorize @pre_check

    unless @pre_check.external_id.present?
      render_error "pre_check.no_certificate", status: :not_found
      return
    end

    begin
      archistar = Wrappers::Archistar.new
      url = archistar.get_submission_pdf_report(@pre_check.external_id)

      render json: { pdf_report_url: url }
    rescue => e
      Rails.logger.error("Failed to fetch PDF report URL: #{e.message}")
      render_error "pre_check.pdf_report_unavailable",
                   status: :service_unavailable,
                   message_opts: {
                   }
    end
  end

  def download_pre_check_user_consent_csv
    authorize :pre_check, :download_pre_check_user_consent_csv?

    csv_data = PreCheckExportService.new.user_consent_csv
    send_data csv_data, type: "text/csv"
  end

  private

  def set_pre_check
    @pre_check = PreCheck.find(params[:id])
  end

  def pre_check_params
    params.require(:pre_check).permit(
      :status,
      :full_address,
      :pid,
      :permit_application_id,
      :jurisdiction_id,
      :permit_type_id,
      :service_partner,
      :eula_accepted,
      :consent_to_send_drawings,
      :consent_to_share_with_jurisdiction,
      :consent_to_research_contact,
      design_documents_attributes: [
        :id,
        :_destroy,
        file: [:id, :storage, metadata: %i[size filename mime_type]]
      ]
    )
  end
end
