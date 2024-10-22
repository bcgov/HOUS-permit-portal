class IntegrationMappingBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :jurisdiction_id, :template_version_id

    field :elective_filtered_requirements_mapping, name: :requirements_mapping

    field :requirements_mapping_json do |integration_mapping|
      integration_mapping.elective_filtered_requirements_mapping.to_json
    end
  end

  view :external_api do
    field :elective_filtered_requirements_mapping, name: :requirements_mapping

    association :template_version,
                blueprint: TemplateVersionBlueprint,
                view: :external_api,
                name: :permit_version
  end
end
