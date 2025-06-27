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

  def step_code_metrics_params
    params.permit(:step_code_type)
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
