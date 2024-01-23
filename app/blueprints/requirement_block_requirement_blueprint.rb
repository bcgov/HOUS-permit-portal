class RequirementBlockRequirementBlueprint < Blueprinter::Base
  identifier :id

  association :requirement, blueprint: RequirementBlueprint
end
