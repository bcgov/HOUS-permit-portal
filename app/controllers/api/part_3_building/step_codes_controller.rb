class Api::Part3Building::StepCodesController < Api::ApplicationController
  def create
    authorize Part3StepCode.new
    @step_code =
      (
        if step_code_params[:permit_application_id]
          Part3StepCode.where(
            permit_application_id: step_code_params[:permit_application_id]
          ).first_or_create!(step_code_params)
        else
          # early access
          # TODO - this will create a new step code on every page refresh..
          #        should we persist the session to retrieve the current early access step code if present?
          Part3StepCode.create(step_code_params)
        end
      )
    render_success @step_code
  end

  private

  def step_code_params
    params.require(:step_code).permit(
      :permit_application_id,
      checklist_attributes: [section_completion_status: {}]
    )
  end
end
