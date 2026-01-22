class Api::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern
  include Api::Concerns::Search::StepCodes

  # DELETE /api/step_codes/:id
  # PATCH /api/step_codes/:id

  before_action :set_step_code, only: %i[update destroy restore]
  skip_after_action :verify_policy_scoped, only: %i[index]

  # GET /api/step_codes (or POST /api/step_codes/search similar to other controllers)
  def index
    perform_step_code_search
    authorized_results = apply_search_authorization(@step_code_search, :index)
    render_success authorized_results,
                   nil,
                   {
                     meta: page_meta(@step_code_search),
                     blueprint: StepCodeBlueprint
                   }
  end

  def update
    authorize @step_code

    # Prevent updating archived step codes
    if @step_code.discarded?
      return(
        render_error "step_code.update_archived_error",
                     {
                       status: 422,
                       log_args: {
                         errors: "Cannot update archived step code"
                       }
                     }
      )
    end

    begin
      # disallow updating step code if it's tied to a permit application and the user is not the submitter (for now)
      if step_code_params[:permit_application_id].present?
        target_pa =
          PermitApplication.find_by(
            id: step_code_params[:permit_application_id]
          )
        unless StepCodePolicy.new(pundit_user, @step_code).reassign_to?(
                 target_pa
               )
          render_error "misc.user_not_authorized_error",
                       {
                         status: 403,
                         log_args: {
                           errors:
                             "User not authorized to reassign step code to permit application"
                         }
                       } and return
        end
      end

      StepCode.transaction do
        # If assigning to a permit application that already has a different step code,
        # detach the previous one so this update can succeed (overtake behavior).
        if step_code_params[:permit_application_id].present?
          existing =
            StepCode
              .kept
              .where(
                permit_application_id: step_code_params[:permit_application_id]
              )
              .where.not(id: @step_code.id)
              .first
          existing&.update!(permit_application_id: nil)
        end

        @step_code.update!(step_code_params)
      end
      render_success @step_code,
                     "step_code.update_success",
                     { blueprint: StepCodeBlueprint }
    rescue ActiveRecord::RecordInvalid => e
      render_error "step_code.update_error",
                   message_opts: {
                     error_message: e.record.errors.full_messages.join(", ")
                   },
                   log_args: {
                     errors: e.record.errors.full_messages
                   }
    end
  end

  def destroy
    authorize @step_code
    if @step_code.discard
      render_success(
        @step_code,
        "step_code.destroy_success",
        { blueprint: StepCodeBlueprint }
      )
    else
      render_error "step_code.destroy_error",
                   log_args: {
                     errors: @step_code.errors.full_messages
                   }
    end
  end

  def restore
    authorize @step_code
    if @step_code.update(discarded_at: nil)
      render_success(
        @step_code,
        "step_code.restore_success",
        { blueprint: StepCodeBlueprint }
      )
    else
      render_error "step_code.restore_error",
                   log_args: {
                     errors: @step_code.errors.full_messages
                   }
    end
  end

  def download_step_code_summary_csv
    authorize :step_code, :download_step_code_summary_csv?

    csv_data = StepCodeExportService.new.summary_csv
    send_data csv_data, type: "text/csv"
  end

  def download_step_code_metrics_csv
    authorize :step_code, :download_step_code_metrics_csv?

    step_code_type = step_code_metrics_params[:step_code_type]
    service = StepCodeExportService.new

    csv_data =
      case step_code_type
      when "Part3StepCode"
        service.part_3_metrics_csv
      when "Part9StepCode"
        service.part_9_metrics_csv
      else
        raise ActionController::BadRequest, "Invalid step code type"
      end

    send_data csv_data, type: "text/csv"
  end

  private

  def set_step_code
    @step_code = StepCode.find(params[:id])
  end

  def step_code_metrics_params
    params.permit(:step_code_type)
  end
end
