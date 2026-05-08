class HelpVideoDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :type, :created_at, :scan_status

  field :help_video_id
  field :file, transformer: Transformers::FileAttachmentTransformer
end
