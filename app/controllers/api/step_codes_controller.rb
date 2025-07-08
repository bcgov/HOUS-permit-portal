class Api::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern

  # DELETE /api/step_codes/:id

  def create
    step_code_class = params[:step_code][:type].safe_constantize
    unless step_code_class &&
             [Part3StepCode, Part9StepCode].include?(step_code_class)
      render_error("step_code.create_error", status: :bad_request)
      return
    end

    @step_code = step_code_class.new(step_code_params)
    authorize @step_code

    if @step_code.save
      render_success @step_code,
                     "step_code.create_success",
                     {
                       blueprint: StepCodeBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error(
        "step_code.create_error",
        message_opts: {
          error_message: @step_code.errors.full_messages.join(", ")
        }
      )
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
end
