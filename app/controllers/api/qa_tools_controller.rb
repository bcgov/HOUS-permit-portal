class Api::QaToolsController < Api::ApplicationController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  before_action :require_qa_mode!
  before_action :require_sandbox_for_review_staff!,
                only: %i[create_full_permit_project autofill_permit_application]
  before_action :set_permit_application, only: %i[autofill_permit_application]

  def create_full_permit_project
    authorize PermitProject, :create?

    result =
      Qa::FullPermitProjectService.new(
        current_user: current_user,
        current_sandbox: current_sandbox,
        jurisdiction_id: qa_full_permit_project_params[:jurisdiction_id],
        title: qa_full_permit_project_params[:title]
      ).call

    render_success result[:project],
                   "qa_tools.full_permit_project_success",
                   {
                     blueprint: PermitProjectBlueprint,
                     blueprint_opts: {
                       view: :extended,
                       current_user: current_user
                     },
                     status: :created
                   }
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound => e
    render_error(
      "qa_tools.full_permit_project_error",
      {
        status: :unprocessable_entity,
        message_opts: {
          error_message: e.message
        }
      },
      e
    )
  end

  def autofill_permit_application
    authorize @permit_application, :qa_autofill?

    Qa::PermitApplicationAutofillService.new(
      permit_application: @permit_application,
      current_user: current_user
    ).call

    render_success @permit_application,
                   "qa_tools.autofill_permit_application_success",
                   {
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :extended,
                       current_user: current_user
                     }
                   }
  rescue ActiveRecord::RecordInvalid => e
    render_error(
      "qa_tools.autofill_permit_application_error",
      {
        status: :unprocessable_entity,
        message_opts: {
          error_message: e.message
        }
      },
      e
    )
  end

  private

  def require_qa_mode!
    return if ENV["VITE_QA_MODE"] == "true"

    head :not_found
  end

  def require_sandbox_for_review_staff!
    return unless current_user.review_staff?
    return if current_sandbox.present?

    render_error "misc.user_not_authorized_error", { status: :forbidden }
  end

  def set_permit_application
    @permit_application =
      if current_user.submitter? || current_user.super_admin?
        PermitApplication.find(params[:id])
      else
        PermitApplication.for_sandbox(current_sandbox).find(params[:id])
      end
  end

  def qa_full_permit_project_params
    params.require(:qa_full_permit_project).permit(:jurisdiction_id, :title)
  end
end
