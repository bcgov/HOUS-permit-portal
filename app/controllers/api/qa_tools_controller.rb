class Api::QaToolsController < Api::ApplicationController
  skip_after_action :verify_authorized
  skip_after_action :verify_policy_scoped

  before_action :require_qa_mode!
  before_action :set_permit_application, only: %i[autofill_permit_application]
  before_action :set_part_3_step_code, only: %i[autofill_part_3_step_code]
  before_action :set_part_9_step_code, only: %i[autofill_part_9_step_code]

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

  def autofill_part_3_step_code
    authorize @step_code, :qa_autofill?

    Qa::Part3StepCodeAutofillService.new(
      step_code: @step_code,
      current_user: current_user,
      stage: params[:stage]
    ).call

    render_success @step_code,
                   "qa_tools.autofill_part_3_step_code_success",
                   { blueprint: Part3StepCodeBlueprint }
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    render_error(
      "qa_tools.autofill_part_3_step_code_error",
      {
        status: :unprocessable_entity,
        message_opts: {
          error_message: e.message
        }
      },
      e
    )
  end

  def autofill_part_9_step_code
    authorize @step_code, :qa_autofill?

    Qa::Part9StepCodeAutofillService.new(
      step_code: @step_code,
      current_user: current_user,
      stage: params[:stage]
    ).call

    render_success @step_code,
                   "qa_tools.autofill_part_9_step_code_success",
                   { blueprint: Part9StepCodeBlueprint }
  rescue ActiveRecord::RecordInvalid, ArgumentError => e
    render_error(
      "qa_tools.autofill_part_9_step_code_error",
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
    if ENV["VITE_QA_MODE"] == "true" && SiteConfiguration.qa_tools_enabled?
      return
    end

    head :not_found
  end

  def set_permit_application
    @permit_application = PermitApplication.find(params[:id])
  end

  def set_part_3_step_code
    @step_code = Part3StepCode.find(params[:id])
  end

  def set_part_9_step_code
    @step_code = Part9StepCode.find(params[:id])
  end

  def qa_full_permit_project_params
    params.require(:qa_full_permit_project).permit(:jurisdiction_id, :title)
  end
end
