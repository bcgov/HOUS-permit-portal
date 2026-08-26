class JurisdictionTemplateVersionCustomizationBlueprint < Blueprinter::Base
  identifier :id

  fields :jurisdiction_id, :customizations, :disabled, :requires_project_meeting
end
