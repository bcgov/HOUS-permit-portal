class NoteAttachmentDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :note_id, :scan_status

  field :file, transformer: Transformers::FileAttachmentTransformer
end
