class RequirementDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :requirement_block_id

  field :file, transformer: Transformers::FileAttachmentTransformer
end
