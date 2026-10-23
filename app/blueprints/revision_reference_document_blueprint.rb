class RevisionReferenceDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :revision_request_id, :scan_status

  field :file_url
  field :file, transformer: Transformers::FileAttachmentTransformer
end
