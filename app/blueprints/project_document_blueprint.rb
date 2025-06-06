# app/blueprints/project_document_blueprint.rb
require_relative "transformers/file_attachment_transformer" # Ensure the transformer is loaded

class ProjectDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at # Add :updated_at if needed by IBaseFileAttachment on frontend

  # Assumes your ProjectDocument model has a permit_project_id attribute
  field :permit_project_id

  # Use the transformer for the file field
  field :file, transformer: FileAttachmentTransformer
end
