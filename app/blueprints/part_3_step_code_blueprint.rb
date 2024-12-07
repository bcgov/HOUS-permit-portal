class Part3StepCodeBlueprint < Blueprinter::Base
  identifier :id

  fields :type

  association :checklist, blueprint: StepCode::Part3::ChecklistBlueprint
end
