class Part9StepCode < StepCode
  BUILDING_CHARACTERISTICS_LINE_KEYS = %i[
    roof_ceilings_lines
    above_grade_walls_lines
    framings_lines
    unheated_floors_lines
    below_grade_walls_lines
    slabs_lines
    doors_lines
    space_heating_cooling_lines
    hot_water_lines
    ventilation_lines
  ].freeze

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
    checklist.stage_completed_at = nil
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

    building_characteristics_attrs = []
    checklist.data_entries.each do |data_entry|
      # Shrine attachment presence check
      if data_entry.h2k_file_attacher&.attached?
        begin
          # Use Shrine's API to access the file contents
          xml_content = nil
          data_entry.h2k_file.open { |io| xml_content = io.read }
          xml = Nokogiri.XML(xml_content)
          StepCode::Part9::DataEntryFromHot2000.new(
            xml: xml,
            data_entry: data_entry
          ).call
          building_characteristics_attrs << StepCode::Part9::BuildingCharacteristicsHot2000Mapper.new(
            xml: xml
          ).mappings
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

    apply_building_characteristics_attrs(
      checklist,
      building_characteristics_attrs
    )
  end

  def apply_building_characteristics_attrs(checklist, attrs_collection)
    generated_attrs =
      attrs_collection
        .compact
        .reduce({}) do |merged_attrs, attrs|
          merge_building_characteristics_attrs(merged_attrs, attrs)
        end
    return if generated_attrs.blank?

    summary =
      checklist.building_characteristics_summary ||
        checklist.create_building_characteristics_summary
    update_attrs =
      merge_building_characteristics_summary_attrs(summary, generated_attrs)
    summary.update!(update_attrs) if update_attrs.present?
  end

  def merge_building_characteristics_summary_attrs(summary, generated_attrs)
    BUILDING_CHARACTERISTICS_LINE_KEYS
      .each_with_object({}) do |key, attrs|
        generated_lines = generated_attrs[key]
        next if generated_lines.blank?

        attrs[key] = merge_characteristic_lines(
          summary.public_send(key),
          generated_lines
        )
      end
      .tap do |attrs|
        attrs[:windows_glazed_doors] = merge_windows_glazed_doors(
          summary.windows_glazed_doors,
          generated_attrs[:windows_glazed_doors]
        )
        attrs[:airtightness] = merge_characteristic_hash(
          summary.airtightness,
          generated_attrs[:airtightness]
        )
        attrs[:fossil_fuels] = merge_characteristic_hash(
          summary.fossil_fuels,
          generated_attrs[:fossil_fuels]
        )
        attrs.compact!
      end
  end

  def merge_building_characteristics_attrs(existing_attrs, new_attrs)
    merged_attrs = existing_attrs.deep_dup
    BUILDING_CHARACTERISTICS_LINE_KEYS.each do |key|
      next if new_attrs[key].blank?

      merged_attrs[key] = merge_characteristic_lines(
        merged_attrs[key],
        new_attrs[key]
      )
    end
    merged_attrs[:windows_glazed_doors] = merge_windows_glazed_doors(
      merged_attrs[:windows_glazed_doors],
      new_attrs[:windows_glazed_doors]
    )
    merged_attrs[:airtightness] = new_attrs[:airtightness] ||
      merged_attrs[:airtightness]
    merged_attrs[:fossil_fuels] = new_attrs[:fossil_fuels] ||
      merged_attrs[:fossil_fuels]
    merged_attrs.compact
  end

  def merge_characteristic_lines(existing_lines, generated_lines)
    existing =
      characteristic_array(existing_lines).reject do |line|
        blank_characteristic_line?(line)
      end
    generated =
      characteristic_array(generated_lines).reject do |line|
        blank_characteristic_line?(line)
      end
    return generated if existing.blank?

    (existing + generated).uniq do |line|
      line[:details].presence || line["details"].presence || line.to_s
    end
  end

  def merge_windows_glazed_doors(existing, generated)
    return if generated.blank?

    existing_attrs = characteristic_hash(existing)
    generated_attrs = characteristic_hash(generated)
    lines =
      merge_characteristic_lines(
        existing_attrs[:lines] || existing_attrs["lines"],
        generated_attrs[:lines] || generated_attrs["lines"]
      )
    return if lines.blank?

    {
      performance_type:
        existing_attrs[:performance_type] ||
          existing_attrs["performance_type"] ||
          generated_attrs[:performance_type] ||
          generated_attrs["performance_type"],
      lines: lines
    }.compact
  end

  def merge_characteristic_hash(existing, generated)
    return if generated.blank?

    existing_attrs = characteristic_hash(existing)
    return generated if existing_attrs.blank?

    existing_attrs
  end

  def characteristic_array(value)
    Array(value).map { |item| characteristic_hash(item) }
  end

  def characteristic_hash(value)
    attrs = value.respond_to?(:attributes) ? value.attributes : value
    return {} unless attrs.respond_to?(:to_h)

    attrs.to_h.symbolize_keys.compact_blank
  end

  def blank_characteristic_line?(line)
    line.blank? ||
      line.except(:performance_type, :variant).values.all?(&:blank?)
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
