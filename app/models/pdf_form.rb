class PdfForm < ApplicationRecord
  searchkick searchable: %i[project_number address],
             word_start: %i[project_number address]

  include FileUploader.Attachment(:pdf_file)

  belongs_to :user
  validates :user_id, presence: true
  validates :form_json, presence: true
  has_many :overheating_documents, dependent: :destroy, inverse_of: :pdf_form
  accepts_nested_attributes_for :overheating_documents, allow_destroy: true

  before_validation :sync_promoted_fields

  PDF_FORM_PDF_DATA_KEY = "pdf_form_pdf"

  enum :pdf_generation_status,
       { not_started: 0, queued: 1, generating: 2, completed: 3, failed: 4 },
       default: :not_started,
       prefix: true

  # Override form_json to merge promoted fields back in for the blueprint.
  def form_json
    json = self[:form_json] || {}
    return json unless json.is_a?(Hash)

    json = json.deep_dup

    json["project_number"] = project_number if project_number.present?

    if model.present? || site.present? || lot.present? || address.present?
      bl_key =
        json.key?("buildingLocation") ? "buildingLocation" : "building_location"
      json[bl_key] ||= {}

      if json[bl_key].is_a?(Hash)
        json[bl_key]["model"] = model if model.present?
        json[bl_key]["site"] = site if site.present?
        json[bl_key]["lot"] = lot if lot.present?
        json[bl_key]["address"] = address if address.present?
      end
    end

    json
  end

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

  private

  def sync_promoted_fields
    return if form_json.blank?

    # 1. Sync from form_json to columns if columns are empty
    self.project_number ||=
      form_json["project_number"] || form_json["projectNumber"]

    bl = form_json["building_location"] || form_json["buildingLocation"]
    if bl.is_a?(Hash)
      self.model ||= bl["model"]
      self.site ||= bl["site"]
      self.lot ||= bl["lot"]
      self.address ||= bl["address"]
    end

    # 2. Strip from form_json to ensure the database has only one source of truth
    form_json.delete("project_number")
    form_json.delete("projectNumber")

    %w[building_location buildingLocation].each do |key|
      if form_json[key].is_a?(Hash)
        form_json[key] = form_json[key].except(
          "model",
          "site",
          "lot",
          "address"
        )
        form_json.delete(key) if form_json[key].empty?
      end
    end
  end
end
