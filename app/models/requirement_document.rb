class RequirementDocument < FileUploadAttachment
  belongs_to :requirement_block

  include FileUploader.Attachment(:file)

  validates :requirement_block_id, presence: true

  def attached_to
    requirement_block
  end
end
