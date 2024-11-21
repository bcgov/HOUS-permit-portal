class Api::StepCodesController < Api::ApplicationController
  def index
    @step_codes = policy_scope(StepCode)
    #TODO: remove select_options from meta, reroute the front
    render_success @step_codes,
                   nil,
                   {
                     blueprint: StepCodeBlueprint,
                     meta: {
                       select_options: Part9StepCode::Checklist.select_options,
                       part_9_select_options:
                         Part9StepCode::Checklist.select_options,
                       part_3_select_options:
                         Part3StepCode::Checklist.select_options
                     }
                   }
  end

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

  private

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
