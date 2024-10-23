module StepCodeFieldExtraction
  extend ActiveSupport::Concern

  # ASSUMPTIONS:
  # plan related fields come from extracted data from digital seal validation
  # if there is no extraction put the details there
  # if there is no override on the configuration for which requirement_code to look for, make an assumption
  # we decided to just use the full address instead of the postal code since it should include it

  # def step_code_builder
  #   #we have no logic for this yet, but eventually we should tell this from contacts
  # end

  def step_code_plan_author
    return if step_code_plan_document.blank?
    # assumed to be the last signature placed on the file
    step_code_plan_document.last_signer[:name]
  end

  def step_code_plan_version
    return if step_code_plan_document.blank?
    # assumed to be the file name
    step_code_plan_document.file_data.dig("metadata", "filename")
  end

  def step_code_plan_date
    return if step_code_plan_document.blank?
    # assumed to be the date the last signature placed onteh file was
    step_code_plan_document.last_signer[:date]
  end

  # protected

  def step_code_plan_field
    # can be overridden by config settings requirement_energy_step_code["plan_file_field"]
    requirements_lookups.keys.find do |k|
      k.ends_with?("|#{Requirement::STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE}")
    end
  end

  def step_code_plan_document # looks for the first instance that matches the plan field
    @doc ||= active_supporting_documents.find_by(data_key: step_code_plan_field)
  end

  def requirement_energy_step_code_key_value
    # energy stepcode is a unique field, look at the published form_json to find item with lookup_type: "energy_step_code"
    requirements_lookups.find do |k, v|
      v["requirementInputType"] == "energy_step_code"
    end
  end
end
