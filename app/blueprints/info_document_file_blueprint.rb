class InfoDocumentFileBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at, :scan_status

  field :info_document_id
  field :file, transformer: Transformers::FileAttachmentTransformer

  field :file_url do |file, _options|
    file.file_url(disposition: "inline") if file.file_available?
  rescue StandardError
    nil
  end

  field :download_url do |file, _options|
    file.file_url(disposition: "attachment") if file.file_available?
  rescue StandardError
    nil
  end
end
