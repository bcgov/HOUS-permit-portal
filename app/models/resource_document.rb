class ResourceDocument < FileUploadAttachment
  belongs_to :resource, inverse_of: :resource_document

  include FileUploader.Attachment(:file)

  validates :resource, presence: true

  def attached_to
    resource
  end
end
