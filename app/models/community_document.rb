class CommunityDocument < FileUploadAttachment
  belongs_to :jurisdiction, inverse_of: :community_documents
  has_many :community_document_property_plan_jurisdictions, dependent: :destroy
  has_many :property_plan_jurisdictions,
           through: :community_document_property_plan_jurisdictions

  include FileUploader.Attachment(:file)

  validates :jurisdiction, presence: true

  def attached_to
    jurisdiction
  end
end
