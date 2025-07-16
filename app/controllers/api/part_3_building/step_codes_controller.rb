class Api::Part3Building::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern

  before_action :set_step_code, only: [:show]

  def show
    authorize @step_code
    render_success @step_code, nil, { blueprint: Part3StepCodeBlueprint }
  end

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

  def set_step_code
    @step_code = Part3StepCode.find(params[:id])
  end

  def step_code_params_with_creator
    step_code_params.merge(creator: current_user)
  end
end
