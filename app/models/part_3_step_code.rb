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
end
