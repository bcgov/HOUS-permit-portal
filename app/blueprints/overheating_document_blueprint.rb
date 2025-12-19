class OverheatingDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  field :pdf_form_id

  field :file, transformer: Transformers::FileAttachmentTransformer
end
