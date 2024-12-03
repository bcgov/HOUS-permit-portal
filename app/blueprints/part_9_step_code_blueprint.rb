class Part9StepCodeBlueprint < Blueprinter::Base
  identifier :id

  fields :type

  association :checklists, blueprint: StepCode::Part9::ChecklistBlueprint
end
