class IntegrationMappingBlueprint < Blueprinter::Base
  identifier :id

  fields :jurisdiction_id, :template_version_id, :requirements_mapping

  field :requirements_mapping_json do |integration_mapping|
    integration_mapping.requirements_mapping.to_json
  end
end
