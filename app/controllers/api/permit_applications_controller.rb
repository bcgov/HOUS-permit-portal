class Api::PermitApplicationsController < Api::ApplicationController
  include Api::Concerns::Search::PermitApplications

  before_action :set_permit_application,
                only: %i[
                  show
                  update
                  submit
                  upload_supporting_document
                  finalize_revision_requests
                  mark_as_viewed
                  update_version
                  generate_missing_pdfs
                  update_revision_requests
                  create_permit_collaboration
                ]
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

  def mark_as_viewed
    authorize @permit_application
    @permit_application.update_viewed_at
    render_success @permit_application, nil, { blueprint_opts: { view: :jurisdiction_review_extended } }
  end

  def show
    authorize @permit_application
    render_success @permit_application,
                   nil,
                   {
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: show_blueprint_view_for(current_user),
                     },
                   }
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

  def update_revision_requests
    authorize @permit_application
    if @permit_application.submitted? && @permit_application.latest_submission_version&.update(revision_request_params)
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

  def update_version
    authorize @permit_application

    if TemplateVersioningService.update_draft_permit_with_new_template_version(@permit_application)
      render_success @permit_application,
                     ("permit_application.update_version_succes"),
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
    # for submissions, we do not run the automated compliance as that should have already been complete

    if @permit_application.update(permit_application_params) && @permit_application.submit!
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

  def create_permit_collaboration
    @permit_collaboration =
      PermitApplication::CollaborationManagementService.new(@permit_application).build_permit_collaboration(
        *permit_collaboration_params,
      )

    authorize @permit_collaboration, policy_class: PermitApplicationPolicy

    if @permit_collaboration.save
      render_success @permit_collaboration,
                     "permit_application.assign_collaborator_success",
                     { blueprint: PermitCollaborationBlueprint, blueprint_opts: { view: :base } }
    else
      render_error "permit_application.assign_collaborator_error",
                   message_opts: {
                     error_message: @permit_collaboration.errors.full_messages.join(", "),
                   }
    end
  end

  def generate_missing_pdfs
    authorize @permit_application

    ZipfileJob.perform_async(@permit_application.id, false)

    head :ok
  end

  def finalize_revision_requests
    authorize @permit_application
    if @permit_application.finalize_revision_requests!
      render_success @permit_application,
                     "permit_application.revision_request_finalize_success",
                     { blueprint: PermitApplicationBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error "permit_application.revision_request_finalize_error"
    end
  end

  private

  def show_blueprint_view_for(user)
    user.review_staff? ? :jurisdiction_review_extended : :extended
  end

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

  def permit_collaboration_params
    params.require(:permit_collaboration).permit(:collaborator_id, :collaborator_type, :assigned_requirement_block_id)
  end

  def supporting_document_params
    params.require(:permit_application).permit(
      supporting_documents_attributes: [:data_key, file: [:id, :storage, metadata: {}]],
    )
  end

  def submitted_permit_application_params # params for submitters
    params.require(:permit_application).permit(:reference_number)
  end

  def revision_request_params # params for submitters
    params.require(:submission_version).permit(
      revision_requests_attributes: [
        :id,
        :user_id,
        :_destroy,
        :reason_code,
        :comment,
        requirement_json: {
        },
        submission_json: {
        },
      ],
    )
  end
end
