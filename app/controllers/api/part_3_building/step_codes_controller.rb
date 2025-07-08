class Api::Part3Building::StepCodesController < Api::ApplicationController
  def create
    authorize Part3StepCode.new
    @step_code = Part3StepCode.new(step_code_params_with_creator)

    if @step_code.save
      render_success @step_code,
                     "step_code.create_success",
                     { blueprint: Part3StepCodeBlueprint }
    else
      render_error "step_code.create_error",
                   message_opts: {
                     error_message: @step_code.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def step_code_params
    params.require(:step_code).permit(
      :permit_application_id,
      :permit_project_id,
      :creator_id,
      checklist_attributes: [:id, { section_completion_status: {} }]
    )
  end

  def step_code_params_with_creator
    step_code_params.merge(creator: current_user)
  end
end
