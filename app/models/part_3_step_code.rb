class Part3StepCode < StepCode
  has_one :checklist,
          class_name: "Part3StepCode::Checklist",
          foreign_key: :step_code_id,
          dependent: :destroy
  accepts_nested_attributes_for :checklist

  def blueprint
    Part3StepCodeBlueprint
  end
end
