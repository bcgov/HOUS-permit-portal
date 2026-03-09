class TemplateSectionBlockBlueprint < Blueprinter::Base
  identifier :id

  field :conditional
  association :requirement_block, blueprint: RequirementBlockBlueprint
end
