class MeetingRequestDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :project_meeting_id, :document_type

  field :file, transformer: Transformers::FileAttachmentTransformer
end
