class SupportingDocumentBlueprint < Blueprinter::Base
  fields :file_name, :file_url, :file_size, :created_at

  view :form_io_details do
    field :file_id, name: :id
    field :id, name: :modelId # convert here, not using humps in front end for this call
    field :model do |sd, options|
      "SupportingDocument"
    end
  end
end
