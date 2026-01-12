class ResourceDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :scan_status

  field :resource_id

  field :file, transformer: Transformers::FileAttachmentTransformer
end
