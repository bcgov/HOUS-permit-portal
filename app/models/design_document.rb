class DesignDocument < FileUploadAttachment
  belongs_to :pre_check, inverse_of: :design_documents

  include FileUploader.Attachment(:file)

  validates :pre_check, presence: true

  def attached_to
    pre_check
  end
end
