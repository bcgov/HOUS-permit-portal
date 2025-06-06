class JurisdictionDocument < FileUploadAttachment
  belongs_to :jurisdiction, inverse_of: :jurisdiction_documents
  has_many :jurisdiction_document_property_plan_jurisdictions,
           dependent: :destroy
  has_many :property_plan_jurisdictions,
           through: :jurisdiction_document_property_plan_jurisdictions

  include FileUploader.Attachment(:file)

  validates :jurisdiction, presence: true

  def attached_to
    jurisdiction
  end
end
