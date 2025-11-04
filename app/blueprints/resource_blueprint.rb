class ResourceBlueprint < Blueprinter::Base
  identifier :id

  fields :category,
         :title,
         :description,
         :resource_type,
         :link_url,
         :updated_at,
         :created_at

  field :jurisdiction_id

  association :resource_document,
              blueprint: ResourceDocumentBlueprint,
              if: ->(_field_name, resource, _options) do
                resource.resource_type == "file"
              end
end
