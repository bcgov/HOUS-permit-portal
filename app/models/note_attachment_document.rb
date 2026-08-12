class NoteAttachmentDocument < FileUploadAttachment
  belongs_to :note, inverse_of: :note_attachment_documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  validates :note, presence: true

  def attached_to
    note
  end
end
