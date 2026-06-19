class Part3StepCode < StepCode
  # HUB-5145: Part 3 is modelled as exactly one checklist per StepCode. A
  # lightweight As-Built slice can set `step_codes.phase`, but true Pre-Con to
  # As-Built comparison/inheritance needs either multiple staged checklists or
  # linked StepCode records.
  has_one :checklist,
          class_name: "Part3StepCode::Checklist",
          foreign_key: :step_code_id,
          dependent: :destroy,
          inverse_of: :step_code
  accepts_nested_attributes_for :checklist

  def complete?
    checklist&.complete?
  end

  def current_checklist
    checklist
  end

  def primary_checklist
    current_checklist
  end

  def blueprint
    Part3StepCodeBlueprint
  end

  def checklist_blueprint
    StepCode::Part3::ChecklistBlueprint
  end
end
