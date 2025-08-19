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
    begin
      Part9StepCode.transaction do
        @step_code =
          if step_code_params[:permit_application_id]
            Part9StepCode.where(
              permit_application_id: step_code_params[:permit_application_id]
            ).first_or_create!(step_code_params_for_create)
          else
            Part9StepCode.create!(step_code_params_for_create)
          end

        # H2K processing occurs in Part9StepCode.after_create callback
        render_success @step_code,
                       "step_code.h2k_imported",
                       { blueprint: Part9StepCodeBlueprint } and return
      end
    rescue ActiveRecord::RecordInvalid => e
      render_error "step_code.create_error",
                   message_opts: {
                     error_message: e.record.errors.full_messages.join(", ")
                   }
    end
  end

  private
end
