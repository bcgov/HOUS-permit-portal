class StepCode::Part3::StepCodeBlueprint < Blueprinter::Base
  identifier :id

  association :checklists, blueprint: StepCode::Part3::ChecklistBlueprint
end
