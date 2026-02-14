class OverheatingTool < ApplicationRecord
  include Discard::Model
  searchkick searchable: %i[project_number address],
             word_start: %i[project_number address]

  include FileUploader.Attachment(:pdf_file)

  belongs_to :user
  validates :user_id, presence: true
  validates :form_json, presence: true
  has_many :overheating_documents,
           dependent: :destroy,
           inverse_of: :overheating_tool
  accepts_nested_attributes_for :overheating_documents, allow_destroy: true

  OVERHEATING_TOOL_PDF_DATA_KEY = "overheating_tool_pdf"

  enum :pdf_generation_status,
       { not_started: 0, queued: 1, generating: 2, completed: 3, failed: 4 },
       default: :not_started,
       prefix: true

  attribute :rollup_status, :string
  enum :rollup_status,
       { new_draft: "new_draft", newly_submitted: "newly_submitted" },
       default: :new_draft,
       prefix: true

  before_validation :set_rollup_status_for_draft

  def schedule_pdf_generation!
    update!(pdf_generation_status: :queued, rollup_status: :newly_submitted)
    OverheatingReportGenerationJob.perform_async(id)
  end

  def pdf_file_url
    return nil unless pdf_file

    pdf_file.url(
      public: false,
      expires_in: 3600,
      response_content_disposition:
        "attachment; filename=\"overheating_tool_#{id}.pdf\""
    )
  end

  def file_url(args = {})
    pdf_file_url
  end

  def search_data
    {
      created_at: created_at,
      user_id: user_id,
      discarded: discarded_at.present?,
      rollup_status: rollup_status,
      project_number: form_json["project_number"] || form_json["projectNumber"],
      address:
        form_json.dig("building_location", "address") ||
          form_json.dig("buildingLocation", "address")
    }
  end

  private

  def set_rollup_status_for_draft
    return if rollup_status_newly_submitted?
    return if form_json.blank?

    self.rollup_status = "new_draft"
  end
end
