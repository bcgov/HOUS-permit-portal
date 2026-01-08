class OverheatingDocument < FileUploadAttachment
  belongs_to :overheating_tool, inverse_of: :overheating_documents

  include FileUploader.Attachment(:file)

  validates :overheating_tool, presence: true

  def attached_to
    overheating_tool
  end
end
