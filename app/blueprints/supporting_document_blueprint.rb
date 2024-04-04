class SupportingDocumentBlueprint < Blueprinter::Base
  fields :file_name, :file_url, :file_size

  view :form_io_details do
    #update later since this particular call will not utilize humps on front end
    field :id do |sd, options|
      sd.file_id
    end

    field :model do |sd, options|
      "SupportingDocument"
    end

    field :modelId do |sd, options|
      sd.id
    end
  end
end
