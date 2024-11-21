class Api::StepCode::Part3Controller < Api::ApplicationController
  def create
    #save step code like normal
    authorize StepCode.new
    StepCode.transaction do
      @step_code = StepCode.create(step_code_params)
      # if @step_code.valid?
      #   render_success @step_code,
      #                  "step_code.h2k_imported",
      #                  { blueprint: StepCodeBlueprint } and return
      # end
    end
    render_error "step_code.create_error",
                 message_opts: {
                   error_message: @step_code.errors.full_messages.join(", ")
                 }
  end

  private

  def step_code_params
    params.require(:step_code).permit(
      :name,
      :permit_application_id
      # pre_construction_checklist_attributes: [
      # ]
    )
  end
end
