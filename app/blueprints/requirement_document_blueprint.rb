class RequirementDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :requirement_block_id

  field :file do |document|
    {
      id: document.file_id,
      storage: document.file_data&.dig("storage"),
      metadata: {
        size: document.file_size,
        filename: document.file_name,
        mime_type: document.file_type
      }
    }
  end
end
