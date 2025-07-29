class Api::StepCodesController < Api::ApplicationController
  include StepCodeParamsConcern

  # DELETE /api/step_codes/:id
  # PATCH /api/step_codes/:id

  before_action :set_step_code, only: %i[update destroy]

  def update
    authorize @step_code
    @step_code.update!(step_code_params)
    render_success @step_code,
                   "step_code.update_success",
                   { blueprint: StepCodeBlueprint }
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
