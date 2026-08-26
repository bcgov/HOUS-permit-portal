class Api::Part9Building::ChecklistsController < Api::ApplicationController
  include Part9StepCodeChecklistParamsConcern
  include StepCodeChecklistControllerConcern

  before_action :set_and_authorize_step_code, only: %i[create]
  before_action :set_and_authorize_checklist, only: %i[show update]

  # HUB-5145: This endpoint is intentionally ahead of the UI. It creates a new
  # staged checklist envelope (for example As-Built) under the existing Part 9
  # StepCode report family. Normal edits must not mutate `stage`; callers should
  # create the envelope here, then switch selection through current_stage or an
  # explicit stage/checklist route.
  def create
    @step_code_checklist =
      @step_code.find_or_create_checklist_for!(
        stage: staged_step_code_checklist_params[:stage],
        attributes: staged_step_code_checklist_params
      )
    authorize @step_code_checklist

    render_success @step_code_checklist,
                   nil,
                   {
                     blueprint: StepCode::Part9::ChecklistBlueprint,
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
    # Prevent viewing checklists of archived Step Codes
    if archived_step_code_checklist?(
         @step_code_checklist,
         action: :show,
         status: 404
       )
      return
    end

    render_success @step_code_checklist,
                   nil,
                   {
                     blueprint: StepCode::Part9::ChecklistBlueprint,
                     blueprint_opts: {
                       view: :extended
                     }
                   }
  end

  # PATCH /api/step_code_checklists
  def update
    # Update step_code reference_number if provided
    if params[:step_code_checklist][:reference_number].present? &&
         @step_code_checklist.step_code.present?
      @step_code_checklist.step_code.update(
        reference_number: params[:step_code_checklist][:reference_number]
      )
    end

    # Prevent updating checklists of archived Step Codes
    if archived_step_code_checklist?(
         @step_code_checklist,
         action: :update,
         status: 422
       )
      return
    end

    data_entries_updated =
      params.dig(:step_code_checklist, :data_entries_attributes).present?

    if @step_code_checklist.update(step_code_checklist_params)
      if data_entries_updated
        @step_code_checklist.step_code&.process_current_h2k_files(
          @step_code_checklist
        )
      end

      # If the client requested report generation and this Step Code is standalone (no permit application),
      # enqueue the standalone report generation job.
      if report_generation_requested?
        enqueue_step_code_report_generation(@step_code_checklist)
      end

      render_success @step_code_checklist,
                     "step_code_checklist.update_success",
                     {
                       blueprint: StepCode::Part9::ChecklistBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "step_code_checklist.update_error",
                   message_opts: {
                     error_message:
                       @step_code_checklist.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_and_authorize_checklist
    @step_code_checklist = Part9StepCode::Checklist.find(params[:id])
    authorize @step_code_checklist
  end

  def set_and_authorize_step_code
    @step_code = Part9StepCode.find(params[:step_code_id])
    authorize @step_code, :update?
  end
end
