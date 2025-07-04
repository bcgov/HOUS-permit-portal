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
          # Early access: try to find via session, otherwise create new and store ID in session
          step_code = nil
          if session[:early_access_part3_step_code_id]
            step_code =
              Part3StepCode.find_by(
                id: session[:early_access_part3_step_code_id]
              )
            # Clear session if ID exists but record doesn't (e.g., deleted)
            session.delete(:early_access_part3_step_code_id) unless step_code
          end

          # Create if not found via session
          # NOTE ABOUT "INSECURE MASS ASSIGNMENT": See step_code_params below
          # section_completion_status is given {} which allows any values
          # however, this is not a sensitive field and is not used in any
          # security critical processes. Clearing this code scanning warning only works temporarily.
          step_code ||= Part3StepCode.create(step_code_params)

          # Store the ID in the session if the record is valid and persisted
          session[
            :early_access_part3_step_code_id
          ] = step_code.id if step_code&.persisted?

          step_code # Return the found or created step_code
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
