class PdfForm < ApplicationRecord
  # [OVERHEATING AUDIT] FormSupportingDocuments is not relevant to what you are trying to accomplish here.
  # please remove it. This is the concern that handles attachments specifically on the permit application.
  include FormSupportingDocuments

  include FileUploader.Attachment(:pdf_file)

  belongs_to :user
  validates :user_id, presence: true
  # [OVERHEATING AUDIT] Why aren't we using well defined database fields for this? form_json might be confused with something used in formio.
  # Mini-lesson: JSON blobs are OK for “draft/unstructured” phases, but once this feature is real,
  # promote the important fields to columns (project number, address pieces, etc.) so we can validate
  # and query/sort efficiently without text-searching the entire JSON payload. This is necessary for our searchkick patterns.
  validates :form_json, presence: true
  has_many :overheating_documents, dependent: :destroy, inverse_of: :pdf_form
  accepts_nested_attributes_for :overheating_documents, allow_destroy: true
  # [OVERHEATING AUDIT] Accepting nested attributes for file attachments is powerful but sharp:
  # make sure controller strong params only allow the exact file metadata we expect, and that policy checks
  # cover both PdfForm and any nested OverheatingDocuments being created/destroyed.

  PDF_FORM_PDF_DATA_KEY = "pdf_form_pdf"

  FORM_TYPES = {
    "single_zone_cooling_heating_tool" => "Single Zone Cooling/Heating Tool"
  }.freeze

  # [OVERHEATING AUDIT] Why are we using form_type if there is literally only one form type?
  # Mini-lesson: if this is a “future-proofing” hook, document the intended roadmap (more types coming),
  # otherwise delete it now to reduce complexity (YAGNI).
  validates :form_type, inclusion: { in: FORM_TYPES.keys }

  attribute :pdf_generation_status, :integer, default: 0
  enum :pdf_generation_status,
       { not_started: 0, queued: 1, generating: 2, completed: 3, failed: 4 },
       default: :not_started,
       prefix: true
  # [OVERHEATING AUDIT] Consider enforcing state transitions (e.g. not_started -> queued -> generating -> completed/failed)
  # in one place (service/job) to avoid “random updates” from controllers.

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
  # [OVERHEATING AUDIT] This signature intentionally accepts any args for compatibility, but we don't use them.
  def file_url(*)
    pdf_file_url
  end
end
