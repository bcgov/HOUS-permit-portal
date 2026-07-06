class Api::Part3Building::ChecklistsController < Api::ApplicationController
  include Part3StepCodeChecklistParamsConcern
  include StepCodeChecklistControllerConcern
  before_action :set_and_authorize_step_code, only: %i[create]
  before_action :set_and_authorize_checklist, only: %i[show update]

  def create
    @checklist =
      @step_code.find_or_create_checklist_for!(
        stage: staged_checklist_params[:stage],
        attributes: staged_checklist_params
      )
    authorize @checklist

    render_success @checklist,
                   nil,
                   {
                     blueprint: StepCode::Part3::ChecklistBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  rescue ActiveRecord::RecordInvalid => e
    render_error "step_code_checklist.update_error",
                 message_opts: {
                   error_message: e.record.errors.full_messages.join(", ")
                 }
  end

  def show
    # Prevent viewing checklists of archived step codes
    if archived_step_code_checklist?(@checklist, action: :show, status: 404)
      return
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
    if archived_step_code_checklist?(@checklist, action: :update, status: 422)
      return
    end

    if @checklist.update(checklist_params)
      # If the client requested report generation and this step code is standalone (no permit application),
      # enqueue the standalone report generation job.
      if report_generation_requested?
        enqueue_step_code_report_generation(@checklist)
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

  def set_and_authorize_step_code
    @step_code = Part3StepCode.find(params[:step_code_id])
    authorize @step_code, :update?
  end
end
