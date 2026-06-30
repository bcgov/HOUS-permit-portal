class Part9StepCode < StepCode
  has_many :checklists,
           class_name: "Part9StepCode::Checklist",
           foreign_key: :step_code_id,
           dependent: :destroy
  # HUB-5145: Part 9 already has staged checklist envelopes. Add
  # StepCode.current_stage and make current_checklist select by that value. If
  # stage payloads diverge beyond today's mixed fields, move them to
  # stage-specific detail models instead of widening this table indefinitely.
  has_one :pre_construction_checklist,
          -> { where(stage: :pre_construction) },
          class_name: "Part9StepCode::Checklist",
          foreign_key: :step_code_id

  accepts_nested_attributes_for :pre_construction_checklist

  before_create :set_plan_fields
  validate :requires_plan_document

  after_create :process_h2k_files

  def complete?
    current_checklist&.complete?
  end

  def checklist_for(stage: current_stage, id: nil)
    return checklists.find_by(id: id) if id.present?

    checklists.find_by(stage: stage)
  end

  def find_or_create_checklist_for!(stage:, attributes: {})
    stage = stage.to_s
    existing = checklists.find_by(stage: stage)
    return existing if existing.present?

    source = nearest_previous_checklist(stage)
    checklist = source.present? ? source.dup : checklists.build
    attrs = attributes.to_h.except("stage", :stage)
    checklist.assign_attributes(attrs)
    checklist.step_code = self
    checklist.stage = stage
    checklist.status = :draft
    checklist.section_completion_status =
      attrs["section_completion_status"] || attrs[:section_completion_status] ||
        Part9StepCode::Checklist::DEFAULT_SECTION_COMPLETION_STATUS

    Part9StepCode.transaction do
      checklist.save!
      clone_checklist_children(source, checklist) if source.present?
      checklist
    end
  end

  def blueprint
    Part9StepCodeBlueprint
  end

  def step_requirements
    return JurisdictionStepRequirement.none if jurisdiction.blank?

    all = jurisdiction.jurisdiction_step_requirements
    all.customizations.any? ? all.customizations : all
  end

  def plan_out_of_date
    permit_application.step_code_plan_author != plan_author ||
      permit_application.step_code_plan_version != plan_version ||
      permit_application.step_code_plan_date != plan_date
  end

  def checklist_blueprint
    StepCode::Part9::ChecklistBlueprint
  end

  def process_current_h2k_files(checklist = current_checklist)
    process_h2k_files(checklist)
  end

  private

  def set_plan_fields
    return if permit_application.blank?

    assign_attributes(
      plan_author: permit_application.step_code_plan_author,
      plan_version: permit_application.step_code_plan_version,
      plan_date: permit_application.step_code_plan_date
    )
  end

  def requires_plan_document
    return if permit_application.blank?

    if permit_application.step_code_plan_document.blank?
      errors.add(
        :plan_version,
        "file is missing. Please upload design package on the permit application first."
      )
      # EVENTUALLY BRING THIS LOGIC BACK ONCE WE DECIDE BEST WAY TO CONFIGURE IF A STEP CODE REQUIRES A SIGNED DOCUMENT.
      # elsif permit_application.step_code_plan_document.compliance_data.blank? ||
      #       permit_application.step_code_plan_document.compliance_data.empty?
      #   errors.add(:plan_version, "file is being verified for author and date.")
      # elsif permit_application.step_code_plan_document.compliance_data.dig("error")
      #   errors.add(:plan_version, "file uploaded failed to verify author and data due to an error with the serivce.")
    end
  end

  def process_h2k_files(checklist = pre_construction_checklist)
    # Ensure the checklist and its data_entries exist to avoid errors
    return unless checklist&.data_entries

    checklist.data_entries.each do |data_entry|
      # Shrine attachment presence check
      if data_entry.h2k_file_attacher&.attached?
        begin
          # Use Shrine's API to access the file contents
          xml_content = nil
          data_entry.h2k_file.open { |io| xml_content = io.read }
          StepCode::Part9::DataEntryFromHot2000.new(
            xml: Nokogiri.XML(xml_content),
            data_entry: data_entry
          ).call
        rescue => e
          # Log the error, but don't let it break the callback chain for other entries
          # or the entire transaction unless that's desired.
          Rails.logger.error "Error processing H2K file for DataEntry #{data_entry.id} in Part9StepCode #{id}: #{e.message}"
          # Optionally, add an error to the StepCode object if you want to surface this failure,
          # though after_create runs inside the transaction, so direct errors might not be ideal here.
          # errors.add(:base, "Failed to process H2K file for one of the data entries.")
        end
      end
    end
  end

  def nearest_previous_checklist(stage)
    stage_index = STAGES.index(stage.to_s)
    return if stage_index.blank? || stage_index.zero?

    STAGES
      .first(stage_index)
      .reverse_each do |previous_stage|
        checklist = checklists.find_by(stage: previous_stage)
        return checklist if checklist.present?
      end

    nil
  end

  def clone_checklist_children(source, target)
    clone_data_entries(source, target)
    clone_building_characteristics_summary(source, target)
  end

  def clone_data_entries(source, target)
    source.data_entries.find_each do |data_entry|
      target.data_entries.create!(
        data_entry.attributes.except(
          "id",
          "checklist_id",
          "created_at",
          "updated_at"
        )
      )
    end
  end

  def clone_building_characteristics_summary(source, target)
    return if source.building_characteristics_summary.blank?

    target_summary =
      target.building_characteristics_summary ||
        target.create_building_characteristics_summary
    target_summary.update!(
      source.building_characteristics_summary.attributes.except(
        "id",
        "checklist_id",
        "created_at",
        "updated_at"
      )
    )
  end
end
