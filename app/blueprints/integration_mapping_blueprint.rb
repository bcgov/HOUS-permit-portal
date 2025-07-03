class IntegrationMappingBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :jurisdiction_id, :template_version_id

    field :elective_filtered_requirements_mapping,
          name: :requirements_mapping do |mapping, options|
      mapping.elective_filtered_requirements_mapping(options[:sandbox])
    end

    field :missing_requirements_mapping do |mapping, options|
      mapping.missing_requirements_mapping(options[:sandbox])
    end

    field :requirements_mapping_json do |integration_mapping, options|
      integration_mapping.elective_filtered_requirements_mapping(
        options[:sandbox]
      ).to_json
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
