class Api::PermitApplicationsController < Api::ApplicationController
  include Api::Concerns::Search::PermitApplications

  before_action :set_permit_application, only: %i[show update submit upload_supporting_document]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_permit_application_search
    authorized_results = apply_search_authorization(@permit_application_search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_application_search.total_pages,
                       total_count: @permit_application_search.total_count,
                       current_page: @permit_application_search.current_page,
                     },
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :base,
                     },
                   }
  end

  def show
    authorize @permit_application

    render_success @permit_application,
                   nil,
                   { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :extended } }

    @permit_application.update_viewed_at if current_user.review_staff?
  end

  def update
    authorize @permit_application
    # always reset the submission section keys until actual submission
    submission_section = permit_application_params.dig("submission_data", "data", "section-completion-key")
    submission_section&.each { |key, value| submission_section[key] = nil }

    if @permit_application.draft? && @permit_application.update(permit_application_params)
      if !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
        AutomatedCompliance::AutopopulateJob.perform_async(@permit_application.id)
      end
      render_success @permit_application,
                     ("permit_application.save_draft_success"),
                     { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :extended } }
    elsif @permit_application.submitted? && @permit_application.update(submitted_permit_application_params)
      render_success @permit_application,
                     ("permit_application.save_success"),
                     { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  def upload_supporting_document
    authorize @permit_application
    success = @permit_application.update(supporting_document_params)
    if success
      regex_pattern =
        "(#{supporting_document_params["supporting_documents_attributes"].map { |spd| spd.dig("file", "id") }.compact.join("|")})$"
      render_success @permit_application.supporting_documents.file_ids_with_regex(regex_pattern),
                     nil,
                     { blueprint: SupportingDocumentBlueprint, blueprint_opts: { view: :form_io_details } }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  def submit
    authorize @permit_application
    signed = permit_application_params["submission_data"]["data"]["section-completion-key"]["signed"]

    # for submissions, we do not run the automated compliance as that should have already been complete
    if signed &&
         @permit_application.update(permit_application_params.merge(status: :submitted, signed_off_at: Time.current))
      @permit_application.send_submit_notifications

      render_success @permit_application,
                     nil,
                     { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error "permit_application.submit_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  def create
    @permit_application = PermitApplication.build(permit_application_params.to_h.merge(submitter: current_user))
    authorize @permit_application
    if @permit_application.save
      if !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
        AutomatedCompliance::AutopopulateJob.perform_async(@permit_application.id)
      end
      render_success @permit_application,
                     "permit_application.create_success",
                     { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error "permit_application.create_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def set_permit_application
    @permit_application = PermitApplication.find(params[:id])
  end

  def permit_application_params # params for submitters
    params.require(:permit_application).permit(
      :activity_id,
      :permit_type_id,
      :jurisdiction_id,
      :full_address,
      :nickname,
      :pin,
      :pid,
      submission_data: {
      },
    )
  end

  def supporting_document_params
    params.require(:permit_application).permit(
      supporting_documents_attributes: [:data_key, file: %i[id storage metadata]],
    )
  end

  def submitted_permit_application_params # params for submitters
    params.require(:permit_application).permit(:reference_number)
  end
end
