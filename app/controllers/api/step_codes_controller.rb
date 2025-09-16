class Api::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern
  include Api::Concerns::Search::StepCodes

  # DELETE /api/step_codes/:id
  # PATCH /api/step_codes/:id

  before_action :set_step_code, only: %i[update destroy]
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
          render_error "misc.user_not_authorized_error", { status: 403 } and
            return
        end
      end

      StepCode.transaction do
        # If assigning to a permit application that already has a different step code,
        # detach the previous one so this update can succeed (overtake behavior).
        if step_code_params[:permit_application_id].present?
          existing =
            StepCode
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
                   }
    end
  end

  def destroy
    @step_code = StepCode.find(params[:id])
    authorize @step_code
    @step_code.destroy!
    render json: {}, status: :ok
  end

  def download_step_code_summary_csv
    authorize :step_code, :download_step_code_summary_csv?

    csv_data = StepCodeExportService.new.summary_csv
    send_data csv_data, type: "text/csv"
  end

  private

  def set_step_code
    @step_code = StepCode.find(params[:id])
  end
end
