class TemplateSectionBlockBlueprint < Blueprinter::Base
  association :requirement_block, blueprint: RequirementBlockBlueprint
end
