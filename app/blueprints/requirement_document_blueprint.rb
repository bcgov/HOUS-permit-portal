require_relative "transformers/file_attachment_transformer" # Ensure the transformer is loaded

class RequirementDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :requirement_block_id

  field :file, transformer: FileAttachmentTransformer
end
