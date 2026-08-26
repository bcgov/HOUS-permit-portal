class InfoDocumentFileBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :scan_status

  field :info_document_id
  field :file, transformer: Transformers::FileAttachmentTransformer

  field :file_url do |file, _options|
    file.file_url_safe(disposition: "inline")
  end

  field :download_url do |file, _options|
    file.file_url_safe(disposition: "attachment")
  end
end
