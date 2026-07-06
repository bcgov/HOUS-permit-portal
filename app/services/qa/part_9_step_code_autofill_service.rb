# frozen_string_literal: true

class Qa::Part9StepCodeAutofillService
  def initialize(step_code:, current_user:)
    @step_code = step_code
    @current_user = current_user
  end

  def call
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
  end

  private

  def update_step_code!
    attributes = Qa::Part9StepCodeAutofillData::STEP_CODE_ATTRIBUTES.dup
    permit_application = @step_code.permit_application

    if permit_application
      attributes[:jurisdiction_id] ||= permit_application.jurisdiction_id
      attributes[:permit_date] ||= permit_application.permit_date

      permit_application.permit_project&.update!(
        full_address: attributes[:full_address]
      )
    end

    @step_code.assign_attributes(attributes)
    @step_code.save!(validate: false)
  end

  def ensure_checklist!
    @step_code.pre_construction_checklist ||
      @step_code.create_pre_construction_checklist!(stage: :pre_construction)
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
    jurisdiction =
      @step_code.jurisdiction || @step_code.permit_application&.jurisdiction

    if jurisdiction.blank?
      jurisdiction = SubDistrict.order(:created_at).first

      if jurisdiction.present?
        @step_code.update!(jurisdiction_id: jurisdiction.id)
        @step_code.reload
      end
    end

    if jurisdiction.blank?
      @step_code.errors.add(
        :jurisdiction,
        "must be set before QA autofill can create step requirements"
      )
      raise ActiveRecord::RecordInvalid, @step_code
    end

    jurisdiction
  end

  def update_checklist!(checklist)
    checklist.update!(
      compliance_path: Qa::Part9StepCodeAutofillData::COMPLIANCE_PATH,
      building_type: Qa::Part9StepCodeAutofillData::BUILDING_TYPE,
      **Qa::Part9StepCodeAutofillData::ENERGY_PERFORMANCE,
      **Qa::Part9StepCodeAutofillData::COMPLETED_BY,
      building_characteristics_summary_attributes:
        Qa::Part9StepCodeAutofillData::BUILDING_CHARACTERISTICS_SUMMARY,
      section_completion_status:
        Qa::Part9StepCodeAutofillData::SECTION_COMPLETION_STATUS
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
