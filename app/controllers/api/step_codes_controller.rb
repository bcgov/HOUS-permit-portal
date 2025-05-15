class Api::StepCodesController < Api::ApplicationController
  # DELETE /api/step_codes/:id
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

  def download_step_code_metrics_json
    authorize :step_code, :download_step_code_metrics_json?

    step_code_type = step_code_metrics_params[:step_code_type]
    timeframe_from = step_code_metrics_params[:timeframe_from]
    timeframe_to = step_code_metrics_params[:timeframe_to]
    service = StepCodeExportService.new

    result =
      case step_code_type
      when "Part3StepCode"
        service.part_3_metrics_json(
          timeframe_from: timeframe_from,
          timeframe_to: timeframe_to
        )
      when "Part9StepCode"
        service.part_9_metrics_json(
          timeframe_from: timeframe_from,
          timeframe_to: timeframe_to
        )
      else
        raise ActionController::BadRequest, "Invalid step code type"
      end
    send_data result.to_json,
              type: "text/plain",
              disposition: "attachment",
              filename: "#{step_code_type.downcase}_metrics.json"
  end

  private

  def step_code_metrics_params
    params.permit(:step_code_type, :timeframe_from, :timeframe_to)
  end

  def step_code_params
    params.require(:step_code).permit(
      :name,
      :permit_application_id,
      pre_construction_checklist_attributes: [
        :compliance_path,
        data_entries_attributes: [
          :district_energy_ef,
          :district_energy_consumption,
          :other_ghg_ef,
          :other_ghg_consumption,
          h2k_file: {
          }
        ]
      ]
    )
  end
end
