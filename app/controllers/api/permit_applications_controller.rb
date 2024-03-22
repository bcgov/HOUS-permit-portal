class Api::PermitApplicationsController < Api::ApplicationController
  include Api::Concerns::Search::PermitApplications
  include Api::Concerns::FormSupportingDocuments
  before_action :set_permit_application, only: %i[show update submit]
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

    if @permit_application.draft? &&
         @permit_application.update_and_respond_with_backend_changes(
           extract_s3_uploads_from_params(permit_application_params),
         )
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

  def submit
    authorize @permit_application
    signed = permit_application_params["submission_data"]["data"]["section-completion-key"]["signed"]

    # for submissions, we do not run the automated compliance as that should have already been complete
    if signed &&
         @permit_application.update_and_respond_with_backend_changes(
           extract_s3_uploads_from_params(
             permit_application_params.merge(status: :submitted, signed_off_at: Time.current),
           ),
         )
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
    attributes = Integrations::LtsaParcelMapBc.new.get_feature_attributes_by_pid(pid: permit_application_params[:pid])
    jurisdiction = Jurisdiction.fuzzy_find_by_ltsa_feature_attributes(attributes)
    @permit_application =
      PermitApplication.build(permit_application_params.to_h.merge(submitter: current_user, jurisdiction: jurisdiction))
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
      :full_address,
      :nickname,
      :pin,
      :pid,
      supporting_documents_attributes: %i[file data_key],
      submission_data: {
      },
    )
  end

  def submitted_permit_application_params # params for submitters
    params.require(:permit_application).permit(:reference_number)
  end
end
