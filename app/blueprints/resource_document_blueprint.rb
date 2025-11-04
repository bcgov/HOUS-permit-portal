class ResourceDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :resource_id

  field :file, transformer: Transformers::FileAttachmentTransformer
end
