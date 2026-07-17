# frozen_string_literal: true

class Qa::Part9StepCodeAutofillService
  def initialize(step_code:, current_user:, stage: nil)
    @step_code = step_code
    @current_user = current_user
    @stage = (stage.presence || step_code.current_stage).to_s
  end

  def call
    checklist = nil
    Part9StepCode.transaction do
      update_step_code!
      checklist = ensure_checklist!
      reset_h2k_state!(checklist)
      upload_and_parse_h2k!(checklist)
      ensure_jurisdiction_step_requirements!
      update_checklist!(checklist)
      assign_step_requirement!(checklist)
    end

    @step_code.reload
    enqueue_report_generation!(checklist)
    @step_code
  end

  private

  def update_step_code!
    Qa::StepCodeAutofillSupport.apply_step_code_project_attributes!(
      @step_code,
      Qa::Part9StepCodeAutofillData::STEP_CODE_ATTRIBUTES.dup,
      validate: false
    )
  end

  def ensure_checklist!
    unless StepCode::STAGES.include?(@stage)
      raise ArgumentError, "Invalid stage: #{@stage}"
    end

    checklist = @step_code.find_or_create_checklist_for!(stage: @stage)
    if @step_code.current_stage != @stage
      @step_code.update!(current_stage: @stage)
    end
    checklist
  end

  def reset_h2k_state!(checklist)
    checklist.data_entries.destroy_all
    checklist.update!(step_requirement_id: nil)
  end

  def upload_and_parse_h2k!(checklist)
    fixture_path = Qa::Part9StepCodeAutofillData::H2K_FIXTURE_PATH
    io = File.open(fixture_path)
    uploaded_file = H2kFileUploader.upload(io, :store, metadata: false)
    uploaded_file.metadata.merge!(
      "filename" => File.basename(fixture_path),
      "size" => File.size(fixture_path),
      "mime_type" => "application/octet-stream"
    )

    data_entry =
      checklist.data_entries.create!(h2k_file_data: uploaded_file.data)

    xml = Nokogiri.XML(File.read(fixture_path))
    StepCode::Part9::DataEntryFromHot2000.new(
      xml: xml,
      data_entry: data_entry
    ).call
    data_entry.update!(
      Qa::Part9StepCodeAutofillData::DATA_ENTRY_COMPLIANCE_PATCH
    )
  end

  def ensure_jurisdiction_step_requirements!
    jurisdiction = ensure_jurisdiction!
    return if @step_code.step_requirements.exists?

    JurisdictionStepRequirement.create!(
      jurisdiction: jurisdiction,
      **Qa::Part9StepCodeAutofillData::QA_STEP_REQUIREMENT
    )
  end

  def ensure_jurisdiction!
    Qa::StepCodeAutofillSupport.ensure_jurisdiction!(@step_code)
  end

  def update_checklist!(checklist)
    checklist.update!(
      compliance_path: Qa::Part9StepCodeAutofillData::COMPLIANCE_PATH,
      building_type: Qa::Part9StepCodeAutofillData::BUILDING_TYPE,
      **Qa::Part9StepCodeAutofillData::ENERGY_PERFORMANCE,
      **Qa::Part9StepCodeAutofillData::COMPLETED_BY,
      building_characteristics_summary_attributes:
        Qa::Part9StepCodeAutofillData::BUILDING_CHARACTERISTICS_SUMMARY,
      status: :draft,
      section_completion_status: autofill_section_completion_status
    )
  end

  def autofill_section_completion_status
    Part9StepCode::Checklist.fully_complete_section_completion_status.deep_merge(
      "report" => {
        "complete" => false
      }
    )
  end

  def enqueue_report_generation!(checklist)
    return if checklist.blank?

    StepCodeReportGenerationJob.perform_async(
      @step_code.id,
      { "checklist_id" => checklist.id }
    )
  end

  def assign_step_requirement!(checklist)
    checklist.reload
    requirement_id =
      checklist.passing_compliance_reports.first&.dig(:requirement_id) ||
        @step_code.step_requirements.first&.id

    return if requirement_id.blank?

    checklist.update!(step_requirement_id: requirement_id)
  end
end
