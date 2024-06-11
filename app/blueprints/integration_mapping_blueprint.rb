class IntegrationMappingBlueprint < Blueprinter::Base
  identifier :id

  fields :jurisdiction_id, :template_version_id, :requirements_mapping
end
