class MeetingRequestDocument < FileUploadAttachment
  belongs_to :project_meeting, inverse_of: :meeting_request_documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  enum :document_type, { supporting: 0, authorization: 1 }, prefix: true

  validates :project_meeting, presence: true
  validates :document_type, presence: true

  def attached_to
    project_meeting
  end
end
