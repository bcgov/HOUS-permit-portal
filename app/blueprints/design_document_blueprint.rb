class DesignDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :pre_check_id

  field :file, transformer: Transformers::FileAttachmentTransformer
end
