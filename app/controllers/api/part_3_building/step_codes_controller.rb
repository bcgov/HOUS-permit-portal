class Api::Part3Building::StepCodesController < Api::ApplicationController
  # respond_to :json # Removed as per user feedback and previous successful diagnosis

  def create
    # authorize Part3StepCode.new # Pundit might need adjustment for polymorphic parent

    parent_resource = find_parent_resource || current_user # Default to current_user if no other parent ID given

    # Initialize Part3StepCode, Pundit authorize might need to be called on the specific instance or with parent
    @step_code = Part3StepCode.new(step_code_params_for_create)
    # It might be more appropriate to authorize based on the parent resource context, or the step_code with its parent assigned.
    # For example: authorize parent_resource, :create_step_code? or authorize @step_code, policy_class: Part3StepCodePolicy
    authorize @step_code # Placeholder: ensure Part3StepCodePolicy is adequate

    @step_code.parent = parent_resource # Assign the determined parent

    if @step_code.save
      render_success @step_code
    else
      render_error(
        "step_code.create_error",
        {
          message_opts: {
            error_message: @step_code.errors.full_messages.join(", ")
          }
        }
      )
    end
  end

  private

  def find_parent_resource
    if params[:permit_application_id]
      PermitApplication.find_by(id: params[:permit_application_id])
    elsif params[:permit_project_id]
      PermitProject.find_by(id: params[:permit_project_id])
      # No explicit user_id check here; defaults to current_user in the create action if others are nil
    else
      nil # No specific parent ID provided in params
    end
  end

  # Renamed from step_code_params to avoid conflict if you have a general step_code_params for update
  def step_code_params_for_create
    # Do not permit :parent_id, :parent_type here. Set parent association directly.
    # :permit_application_id is also removed as it's handled by find_parent_resource
    params.require(:step_code).permit(
      checklist_attributes: [section_completion_status: {}]
      # Add any other direct StepCode attributes here if necessary
    )
  end
end
