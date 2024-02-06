class TemplateSectionBlockBlueprint < Blueprinter::Base
  identifier :id

  association :requirement_block, blueprint: RequirementBlockBlueprint
end
