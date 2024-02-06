class RequirementTemplateSectionBlueprint < Blueprinter::Base
  identifier :id
  fields :name

  association :template_section_blocks, blueprint: TemplateSectionBlockBlueprint
end
