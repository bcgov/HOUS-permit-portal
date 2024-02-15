class API::StepCodesController < API::ApplicationController
  # POST /api/step_codes
  def create
    @step_code = StepCode::InitializeFromHot2000.new(Nokogiri.XML(step_code_params[:h2k_file])).call.step_code
    authorize @step_code

    render json: {}, status: :ok

    # TODO: blueprint
    # render_success @step_code, "step_code.create_success", { blueprint: StepCodeBlueprint }
  end

  private

  def step_code_params
    params.require(:step_code).permit(
      data_entries_attributes: %i[
        h2k_file
        district_energy_ef
        district_energy_consumption
        other_ghg_ef
        other_ghg_consumption
      ],
    )
  end
end
