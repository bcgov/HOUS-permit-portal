# app/blueprints/project_document_blueprint.rb

class ProjectDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :permit_project_id
  field :supporting_information_request_id
  field :kind

  field :file, transformer: Transformers::FileAttachmentTransformer
end
