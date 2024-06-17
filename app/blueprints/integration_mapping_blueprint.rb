class IntegrationMappingBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :jurisdiction_id, :template_version_id, :requirements_mapping

    field :requirements_mapping_json do |integration_mapping|
      integration_mapping.requirements_mapping.to_json
    end
  end

  view :external_api do
    field :requirements_mapping

    association :template_version, blueprint: TemplateVersionBlueprint, view: :external_api, name: :permit_version
  end
end
