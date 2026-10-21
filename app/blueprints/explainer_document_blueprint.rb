class ExplainerDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :scan_status

  field :file, transformer: Transformers::FileAttachmentTransformer
end
