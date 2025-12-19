class OverheatingDocument < FileUploadAttachment
  belongs_to :pdf_form, inverse_of: :overheating_documents

  include FileUploader.Attachment(:file)

  validates :pdf_form, presence: true

  def attached_to
    pdf_form
  end
end
