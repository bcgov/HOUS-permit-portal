class PdfForm < ApplicationRecord
  searchkick searchable: %i[project_number address],
             word_start: %i[project_number address]

  include FileUploader.Attachment(:pdf_file)

  belongs_to :user
  validates :user_id, presence: true
  validates :form_json, presence: true
  has_many :overheating_documents, dependent: :destroy, inverse_of: :pdf_form
  accepts_nested_attributes_for :overheating_documents, allow_destroy: true

  PDF_FORM_PDF_DATA_KEY = "pdf_form_pdf"

  enum :pdf_generation_status,
       { not_started: 0, queued: 1, generating: 2, completed: 3, failed: 4 },
       default: :not_started,
       prefix: true

  def schedule_pdf_generation!
    pdf_generation_status_queued!
    OverheatingReportGenerationJob.perform_async(id)
  end

  def pdf_file_url
    return nil unless pdf_file

    pdf_file.url(
      public: false,
      expires_in: 3600,
      response_content_disposition:
        "attachment; filename=\"pdf_form_#{id}.pdf\""
    )
  end

  def file_url(args = {})
    pdf_file_url
  end

  def search_data
    {
      created_at: created_at,
      user_id: user_id,
      status: status,
      project_number: project_number,
      address: address,
      model: model,
      site: site,
      lot: lot
    }
  end
end
