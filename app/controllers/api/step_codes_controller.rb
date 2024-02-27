class Api::StepCodesController < Api::ApplicationController
  def index
    @step_codes = policy_scope(StepCode)
    render_success @step_codes,
                   nil,
                   {
                     blueprint: StepCodeBlueprint,
                     meta: {
                       select_options:
                         StepCodeChecklist.select_options.merge(
                           {
                             permit_applications:
                               current_user.permit_applications.map { |pa| { id: pa.id, number: pa.number } },
                           },
                         ),
                     },
                   }
  end

  # POST /api/step_codes
  def create
    #save step code like normal
    authorize StepCode.new
    @step_code = StepCode.create!(step_code_params)
    @step_code.data_entries.each do |de|
      StepCode::DataEntryFromHot2000.new(xml: Nokogiri.XML(de.h2k_file.read), data_entry: de).call if de.h2k_file
    end

    render_success @step_code, "step_code.create_success", { blueprint: StepCodeBlueprint }
  rescue StandardError => e
    render_error "step_code.create_error", message_opts: { error_message: e }
  end

  private

  def step_code_params
    params.require(:step_code).permit(
      :name,
      :permit_application_id,
      pre_construction_checklist_attributes: [:compliance_path],
      data_entries_attributes: [
        :district_energy_ef,
        :district_energy_consumption,
        :other_ghg_ef,
        :other_ghg_consumption,
        h2k_file: {
        },
      ],
    )
  end
end
