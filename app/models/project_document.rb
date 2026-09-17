class ProjectDocument < FileUploadAttachment
  belongs_to :permit_project, inverse_of: :project_documents
  belongs_to :supporting_information_request,
             optional: true,
             inverse_of: :project_documents
  belongs_to :uploaded_by, class_name: "User", optional: true

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  enum :kind,
       { reference: "reference", fulfillment: "fulfillment" },
       default: :reference

  validates :permit_project, presence: true

  def attached_to
    permit_project
  end

  def hidden_from_submitter?
    return false if supporting_information_request_id.blank?
    return false unless reference?

    !supporting_information_request.submission_version.request_package_visible_to_submitter?
  end
end
