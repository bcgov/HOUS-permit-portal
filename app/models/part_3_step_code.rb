class Part3StepCode < StepCode
  # HUB-5145: Part 3 still has one checklist, but should converge on staged
  # checklist envelopes: one StepCode report family, child checklists with
  # `stage`, and StepCode.current_stage selecting the current checklist. Stage
  # data may need separate detail models if forms diverge.
  has_many :checklists,
           class_name: "Part3StepCode::Checklist",
           foreign_key: :step_code_id,
           dependent: :destroy,
           inverse_of: :step_code
  has_one :pre_construction_checklist,
          -> { where(stage: :pre_construction) },
          class_name: "Part3StepCode::Checklist",
          foreign_key: :step_code_id,
          inverse_of: :step_code
  accepts_nested_attributes_for :pre_construction_checklist

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
        Part3StepCode::Checklist::DEFAULT_SECTION_COMPLETION_STATUS

    Part3StepCode.transaction do
      checklist.save!
      clone_checklist_children(source, checklist) if source.present?
      checklist
    end
  end

  def checklist
    current_checklist
  end

  def checklist_attributes=(attributes)
    self.pre_construction_checklist_attributes = attributes
  end

  def complete?
    current_checklist&.complete?
  end

  def checklist_for(stage: current_stage, id: nil)
    return checklists.find_by(id: id) if id.present?

    checklists.find_by(stage: stage)
  end

  def blueprint
    Part3StepCodeBlueprint
  end

  def checklist_blueprint
    StepCode::Part3::ChecklistBlueprint
  end

  private

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
    fuel_type_map = clone_fuel_types(source, target)
    clone_simple_children(
      source.baseline_occupancies,
      target.baseline_occupancies
    )
    clone_simple_children(
      source.step_code_occupancies,
      target.step_code_occupancies
    )
    clone_energy_outputs(
      source.reference_energy_outputs,
      target.reference_energy_outputs,
      fuel_type_map
    )
    clone_energy_outputs(
      source.modelled_energy_outputs,
      target.modelled_energy_outputs,
      fuel_type_map
    )
    clone_make_up_air_fuels(
      source.make_up_air_fuels,
      target.make_up_air_fuels,
      fuel_type_map
    )
    clone_simple_children(
      source.document_references,
      target.document_references
    )
  end

  def clone_simple_children(source_records, target_association)
    source_records.find_each do |record|
      target_association.create!(cloned_child_attributes(record))
    end
  end

  def clone_fuel_types(source, target)
    source
      .fuel_types
      .each_with_object({}) do |fuel_type, map|
        cloned = target.fuel_types.create!(cloned_child_attributes(fuel_type))
        map[fuel_type.id] = cloned.id
      end
  end

  def clone_energy_outputs(source_records, target_association, fuel_type_map)
    source_records.find_each do |energy_output|
      attrs = cloned_child_attributes(energy_output)
      attrs["fuel_type_id"] = fuel_type_map.fetch(
        energy_output.fuel_type_id,
        energy_output.fuel_type_id
      )
      target_association.create!(attrs)
    end
  end

  def clone_make_up_air_fuels(source_records, target_association, fuel_type_map)
    source_records.find_each do |make_up_air_fuel|
      attrs = cloned_child_attributes(make_up_air_fuel)
      attrs["fuel_type_id"] = fuel_type_map.fetch(
        make_up_air_fuel.fuel_type_id,
        make_up_air_fuel.fuel_type_id
      )
      target_association.create!(attrs)
    end
  end

  def cloned_child_attributes(record)
    record.attributes.except("id", "checklist_id", "created_at", "updated_at")
  end
end
