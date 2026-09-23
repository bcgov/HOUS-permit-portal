# app/blueprints/project_document_blueprint.rb

class ProjectDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :permit_project_id
  field :file, transformer: Transformers::FileAttachmentTransformer
end
