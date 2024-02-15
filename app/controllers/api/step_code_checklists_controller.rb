class Api::StepCodeChecklistsController < Api::ApplicationController
  before_action :set_and_authorize_checklist, only: %i[show update]

  def index
    @step_code_checklists = policy_scope(StepCodeChecklist).where(step_code_id: params[:step_code_id])
    render_success @step_code_checklists
  end

  def show
    render_success @step_code_checklist,
                   nil,
                   { blueprint: StepCodeChecklistBlueprint, blueprint_opts: { view: :extended } }
  end

  # PATCH /api/step_code_checklists
  def update
    if @step_code_checklist.update(step_code_checklist_params)
      render_success @step_code_checklist,
                     "step_code_checklist.update_success",
                     { blueprint: StepCodeChecklistBlueprint, blueprint_opts: { view: :extended } }
    else
      render_error "step_code_checklist.update_error",
                   message_opts: {
                     error_message: @step_code_checklist.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def step_code_checklist_params
    params.require(:step_code_checklist).permit(
      :compliance_path,
      :completed_by,
      :completed_at,
      :completed_by_company,
      :completed_by_service_organization,
      :completed_by_phone,
      :energy_advisor_id,
      :completed_by_address,
      :completed_by_email,
      :hvac_consumption,
      :dwh_heating_consumption,
      :ref_hvac_consumption,
      :ref_dwh_heating_consumption,
      :epc_calculation_airtightness,
      :epc_calculation_testing_target_type,
      :epc_calculation_compliance,
    )
  end

  def set_and_authorize_checklist
    @step_code_checklist = StepCodeChecklist.find(params[:id])
    authorize @step_code_checklist
  end
end
