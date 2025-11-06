class Api::Part3Building::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern

  before_action :set_step_code, only: [:show]

  def show
    authorize @step_code
    render_success @step_code, nil, { blueprint: Part3StepCodeBlueprint }
  end

  def create
    temp_step_code = Part3StepCode.new(step_code_params_for_create)
    authorize temp_step_code
    begin
      Part3StepCode.transaction do
        @step_code =
          if step_code_params[:permit_application_id]
            Part3StepCode
              .kept
              .where(
                permit_application_id: step_code_params[:permit_application_id]
              )
              .first_or_create!(step_code_params_for_create)
          else
            Part3StepCode.create!(step_code_params_for_create)
          end

        render_success @step_code,
                       "step_code.create_success",
                       { blueprint: Part3StepCodeBlueprint } and return
      end
    rescue ActiveRecord::RecordInvalid => e
      render_error "step_code.create_error",
                   message_opts: {
                     error_message: e.record.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_step_code
    @step_code = Part3StepCode.find(params[:id])
  end
end
