class ProjectDocument < FileUploadAttachment
  belongs_to :permit_project, inverse_of: :project_documents

  include FileUploader.Attachment(:file)

  validates :permit_project, presence: true

  def attached_to
    permit_project
  end
end
