# app/blueprints/project_document_blueprint.rb

class ProjectDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at # Add :updated_at if needed by IBaseFileAttachment on frontend

  # Assumes your ProjectDocument model has a permit_project_id attribute
  field :permit_project_id

  # Use the transformer for the file field
  field :file, transformer: Transformers::FileAttachmentTransformer
end
