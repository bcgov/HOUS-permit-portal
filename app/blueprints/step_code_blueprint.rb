class StepCodeBlueprint < Blueprinter::Base
  identifier :id

  association :checklists, blueprint: StepCodeChecklistBlueprint
end
