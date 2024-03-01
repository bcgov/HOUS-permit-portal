class RequirementTemplateSectionBlueprint < Blueprinter::Base
  identifier :id
  fields :name, :created_at, :updated_at

  association :template_section_blocks, blueprint: TemplateSectionBlockBlueprint
end
