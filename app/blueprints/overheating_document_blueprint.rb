class OverheatingDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :overheating_tool_id

  field :file, transformer: Transformers::FileAttachmentTransformer
end
