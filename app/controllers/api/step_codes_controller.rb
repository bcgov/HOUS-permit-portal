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

  # POST /api/step_codes/:id/download_report_pdf
  def download_report_pdf
    step_code = StepCode.find(params[:id])
    authorize step_code, :download_report_pdf?

    # Stubbed response for next step implementation
    render_success(
      {},
      nil,
      {
        meta: {
          message: "Report PDF generation is queued for implementation."
        }
      }
    )
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
