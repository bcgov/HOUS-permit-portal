class Api::Part3Building::ChecklistsController < Api::ApplicationController
  before_action :set_and_authorize_checklist, only: %i[update]

  def update
    if @checklist.update(checklist_params)
      render_success @checklist,
                     nil,
                     { blueprint: StepCode::Part3::ChecklistBlueprint }
    else
      render_error "step_code_checklist.update_error",
                   message_opts: {
                     error_message: @checklist.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_and_authorize_checklist
    @checklist = Part3StepCode::Checklist.find(params[:id])
    authorize @checklist
  end

  def checklist_params
    params.require(:checklist).permit(section_completion_status: {})
  end
end
