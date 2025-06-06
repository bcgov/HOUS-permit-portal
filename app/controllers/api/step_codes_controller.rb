class Api::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern

  # DELETE /api/step_codes/:id

  def create
    step_code_class = params[:step_code][:type].safe_constantize
    unless step_code_class &&
             [Part3StepCode, Part9StepCode].include?(step_code_class)
      render_error(
        "activerecord.errors.models.step_code.attributes.type.invalid",
        status: :bad_request
      )
      return
    end

    @step_code = step_code_class.new(step_code_params)
    authorize @step_code

    if @step_code.save
      render_success @step_code,
                     "activerecord.attributes.step_code.created",
                     {
                       blueprint: StepCodeBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error("activerecord.errors.models.step_code.create_error")
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
end
