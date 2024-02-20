class Api::StepCodesController < Api::ApplicationController
  def index
    @step_codes = policy_scope(StepCode)
    render json: {}, status: :ok
    # render_success @step_codes, nil, { blueprint: StepCodeBlueprint }
  end

  # POST /api/step_codes
  def create
    #save step code like normal
    authorize StepCode.new
    @step_code = current_user.step_codes.create!(step_code_params)
    @step_code.data_entries.each do |de|
      if de.h2k_file
        StepCode::InitializeFromHot2000.new(xml: Nokogiri.XML(de.h2k_file.read), step_code: @step_code).call
      end
    end
    render json: {}, status: :ok

    # TODO: blueprint
    # render_success @step_code, "step_code.create_success", { blueprint: StepCodeBlueprint }
  rescue StandardError => e
    render_error "step_code.create_error", {}
  end

  def show
    set_and_authorize_step_code
    # render_success @step_code, { blueprint: StepCodeBlueprint }
  end

  def update
    set_and_authorize_step_code
    # render_success @step_code, { blueprint: StepCodeBlueprint }
  end

  private

  def step_code_params
    params.require(:step_code).permit(
      data_entries_attributes: [
        { h2k_file: {} },
        :district_energy_ef,
        :district_energy_consumption,
        :other_ghg_ef,
        :other_ghg_consumption,
      ],
    )
  end

  def set_and_authorize_step_code
    @step_code = StepCode.find(params[:id])
    authorize @step_code
  end
end
