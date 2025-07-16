class Part3StepCode < StepCode
  has_one :checklist,
          class_name: "Part3StepCode::Checklist",
          foreign_key: :step_code_id,
          dependent: :destroy,
          inverse_of: :step_code
  accepts_nested_attributes_for :checklist

  def primary_checklist
    checklist
  end

  def blueprint
    Part3StepCodeBlueprint
  end

  def checklist_blueprint
    StepCode::Part3::ChecklistBlueprint
  end
end
