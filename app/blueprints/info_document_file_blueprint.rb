class InfoDocumentFileBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :scan_status

  field :info_document_id
  field :file, transformer: Transformers::FileAttachmentTransformer
end
