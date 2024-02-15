class StepCodeBlueprint < Blueprinter::Base
  identifier :id

  fields :name

  association :checklists, blueprint: StepCodeChecklistBlueprint
end
