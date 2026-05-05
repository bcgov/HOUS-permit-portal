class RequirementDocument < FileUploadAttachment
  belongs_to :requirement_block, inverse_of: :requirement_documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  validates :requirement_block, presence: true

  def attached_to
    requirement_block
  end
end
