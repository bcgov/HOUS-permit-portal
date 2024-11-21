class Api::StepCode::Part3ChecklistsController < Api::ApplicationController
  before_action :set_and_authorize_checklist, only: %i[show update]

  def index
    @step_code_checklists =
      policy_scope(Part3StepCode::Checklist).where(
        step_code_id: params[:step_code_id]
      )
    render_success @step_code_checklists
  end

  def show
    render_success @step_code_checklist,
                   nil,
                   {
                     blueprint: StepCode::Part3::ChecklistBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  # PATCH /api/step_code_checklists
  def update
    if @step_code_checklist.update(step_code_checklist_params)
      render_success @step_code_checklist,
                     "step_code_checklist.update_success",
                     {
                       blueprint: StepCode::Part3::ChecklistBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "step_code_checklist.update_error",
                   message_opts: {
                     error_message:
                       @step_code_checklist.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def step_code_checklist_params
    params.require(:step_code_checklist).permit()
  end

  def set_and_authorize_checklist
    @step_code_checklist = Part3StepCode::Checklist.find(params[:id])
    authorize @step_code_checklist
  end
end
