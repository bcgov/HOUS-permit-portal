class Api::Part9Building::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern

  def index
    @step_codes = policy_scope(Part9StepCode)
    render_success @step_codes,
                   nil,
                   {
                     blueprint: Part9StepCodeBlueprint,
                     meta: {
                       select_options: Part9StepCode::Checklist.select_options
                     }
                   }
  end

  def select_options
    authorize Part9StepCode, :select_options?
    render_success({ select_options: Part9StepCode::Checklist.select_options })
  end

  # POST /api/step_codes
  def create
    authorize Part9StepCode.new
    @step_code = Part9StepCode.new(step_code_params)
    if @step_code.save
      render_success @step_code,
                     "step_code.create_success",
                     { blueprint: Part9StepCodeBlueprint } and return
    end
    render_error "step_code.create_error",
                 message_opts: {
                   error_message: @step_code.errors.full_messages.join(", ")
                 }
  end

  private
end
