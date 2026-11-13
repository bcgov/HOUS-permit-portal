class ExplainerDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :scan_status

  field :file, transformer: Transformers::FileAttachmentTransformer

  field :file_url do |document, _options|
    document.file_url_safe(disposition: "inline")
  end

  field :download_url do |document, _options|
    document.file_url_safe(disposition: "attachment")
  end
end
