class Api::Part9Building::StepCodesController < Api::ApplicationController
  def index
    @step_codes = policy_scope(Part9StepCode)
    render_success @step_codes,
                   nil,
                   {
                     blueprint: Part9StepCodeBlueprint,
                     meta: {
                       select_options: Part9StepCode::Checklist.select_options
                     }
                   }
  end

  # POST /api/step_codes
  def create
    #save step code like normal
    authorize Part9StepCode.new
    # NOTE ABOUT "INSECURE MASS ASSIGNMENT": See step_code_params below
    # h2k_file is given {} which allows any values
    # however, this is not a sensitive field and is not used in any
    # security critical processes. Clearing this code scanning warning only works temporarily.
    Part9StepCode.transaction do
      @step_code = Part9StepCode.create(step_code_params)
      if @step_code.valid?
        @step_code.pre_construction_checklist.data_entries.each do |de|
          if de.h2k_file
            StepCode::Part9::DataEntryFromHot2000.new(
              xml: Nokogiri.XML(de.h2k_file.read),
              data_entry: de
            ).call
          end
        end
        render_success @step_code,
                       "step_code.h2k_imported",
                       { blueprint: Part9StepCodeBlueprint } and return
      end
    end
    render_error "step_code.create_error",
                 message_opts: {
                   error_message: @step_code.errors.full_messages.join(", ")
                 }
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
          h2k_file: [
            :id,
            :storage,
            metadata: %i[filename size mime_type content_disposition]
          ]
        ]
      ]
    )
  end
end
