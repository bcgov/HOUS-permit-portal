class RevisionReferenceDocument < FileUploadAttachment
  belongs_to :revision_request, inverse_of: :revision_reference_documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  validates :revision_request, presence: true

  def attached_to
    revision_request
  end
end
