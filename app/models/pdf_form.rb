class PdfForm < ApplicationRecord
  include FormSupportingDocuments

  belongs_to :user
  validates :user_id, presence: true
  validates :form_json, presence: true

  PDF_FORM_PDF_DATA_KEY = "pdf_form_pdf"

  FORM_TYPES = {
    "single_zone_cooling_heating_tool" => "Single Zone Cooling/Heating Tool"
  }.freeze

  validates :form_type, inclusion: { in: FORM_TYPES.keys }
end
