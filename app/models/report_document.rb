class ReportDocument < FileUploadAttachment
  belongs_to :step_code, inverse_of: :report_documents

  include FileUploader.Attachment(:file)

  def attached_to
    step_code
  end
end
