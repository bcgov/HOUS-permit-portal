class Api::Part3Building::ChecklistsController < Api::ApplicationController
  include StepCodeParamsConcern
  before_action :set_and_authorize_checklist, only: %i[show update]

  def show
    # Prevent viewing checklists of archived step codes
    if @checklist.step_code&.discarded?
      return(
        render_error "step_code_checklist.show_archived_error",
                     {
                       status: 404,
                       log_args: {
                         errors: "Cannot view checklist of archived step code"
                       }
                     }
      )
    end

    render_success @checklist,
                   nil,
                   {
                     blueprint: StepCode::Part3::ChecklistBlueprint,
                     blueprint_opts: {
                       view: :extended # Assuming Part 3 blueprint also has an extended view
                     }
                   }
  end

  def update
    # Prevent updating checklists of archived step codes
    if @checklist.step_code&.discarded?
      return(
        render_error "step_code_checklist.update_archived_error",
                     {
                       status: 422,
                       log_args: {
                         errors: "Cannot update checklist of archived step code"
                       }
                     }
      )
    end

    if @checklist.update(checklist_params)
      # If the client requested report generation and this step code is standalone (no permit application),
      # enqueue the standalone report generation job.
      should_generate_report =
        ActiveModel::Type::Boolean.new.cast(
          params[:report_generation_requested]
        )
      if should_generate_report
        step_code = @checklist.step_code
        if step_code.present?
          StepCodeReportGenerationJob.perform_async(step_code.id)
        end
      end

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
end
