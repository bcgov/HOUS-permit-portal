class ExplainerDocument < FileUploadAttachment
  belongs_to :explainer, inverse_of: :documents

  include FileUploader.Attachment(:file)
  prepend FilenamePreservingFileUrl

  def attached_to
    explainer
  end
end
