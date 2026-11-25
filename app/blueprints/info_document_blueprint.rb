class InfoDocumentBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :description,
         :sort_order,
         :published_at,
         :created_at,
         :updated_at,
         :scan_status

  field :topic_list, name: :topics

  field :file, transformer: Transformers::FileAttachmentTransformer

  field :file_url do |document, _options|
    document.file_url_safe(disposition: "inline")
  end

  field :download_url do |document, _options|
    document.file_url_safe(disposition: "attachment")
  end
end
