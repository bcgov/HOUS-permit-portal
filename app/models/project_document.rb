class ProjectDocument < FileUploadAttachment
  belongs_to :permit_project

  include FileUploader.Attachment(:file)

  validates :permit_project, presence: true

  def attached_to
    permit_project
  end
end
