class InfoDocumentFile < FileUploadAttachment
  belongs_to :info_document, inverse_of: :document_file, touch: true

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  validates :info_document, presence: true

  def attached_to
    info_document
  end
end
