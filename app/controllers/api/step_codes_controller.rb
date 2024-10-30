class Api::StepCodesController < Api::ApplicationController
  def index
    @step_codes = policy_scope(StepCode)
    render_success @step_codes,
                   nil,
                   {
                     blueprint: StepCodeBlueprint,
                     meta: {
                       select_options: Part9StepCode::Checklist.select_options
                     }
                   }
  end

  # POST /api/step_codes
  def create
    #save step code like normal
    authorize StepCode.new
    StepCode.transaction do
      @step_code = StepCode.create(step_code_params)
      if @step_code.valid?
        @step_code.pre_construction_checklist.data_entries.each do |de|
          if de.h2k_file
            StepCode::DataEntryFromHot2000.new(
              xml: Nokogiri.XML(de.h2k_file.read),
              data_entry: de
            ).call
          end
        end
        render_success @step_code,
                       "step_code.h2k_imported",
                       { blueprint: StepCodeBlueprint } and return
      end
    end
    render_error "step_code.create_error",
                 message_opts: {
                   error_message: @step_code.errors.full_messages.join(", ")
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
