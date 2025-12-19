class PdfForm < ApplicationRecord
  include FormSupportingDocuments
  include FileUploader.Attachment(:pdf_file)

  belongs_to :user
  validates :user_id, presence: true
  validates :form_json, presence: true
  has_many :overheating_documents, dependent: :destroy, inverse_of: :pdf_form
  accepts_nested_attributes_for :overheating_documents, allow_destroy: true

  PDF_FORM_PDF_DATA_KEY = "pdf_form_pdf"

  FORM_TYPES = {
    "single_zone_cooling_heating_tool" => "Single Zone Cooling/Heating Tool"
  }.freeze

  validates :form_type, inclusion: { in: FORM_TYPES.keys }

  def pdf_file_url
    return nil unless pdf_file

    pdf_file.url(
      public: false,
      expires_in: 3600,
      response_content_disposition:
        "attachment; filename=\"pdf_form_#{id}.pdf\""
    )
  end

  # Compatible with StorageController expectations.
  def file_url(*args)
    pdf_file_url
  end
end
