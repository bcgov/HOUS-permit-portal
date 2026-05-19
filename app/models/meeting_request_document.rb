class MeetingRequestDocument < FileUploadAttachment
  belongs_to :project_meeting, inverse_of: :meeting_request_documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  validates :project_meeting, presence: true

  def attached_to
    project_meeting
  end
end
