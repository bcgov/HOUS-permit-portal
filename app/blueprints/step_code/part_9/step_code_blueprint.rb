class StepCode::Part9::StepCodeBlueprint < Blueprinter::Base
  identifier :id

  association :checklists, blueprint: StepCode::Part9::ChecklistBlueprint
end
