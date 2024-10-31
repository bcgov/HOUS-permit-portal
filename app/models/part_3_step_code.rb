class Part3StepCode < StepCode
  has_one :checklist,
          class_name: "Part3StepCode::Checklist",
          foreign_key: :step_code_id,
          dependent: :destroy
end
