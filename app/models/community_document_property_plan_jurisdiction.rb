class CommunityDocumentPropertyPlanJurisdiction < ApplicationRecord
  belongs_to :community_document
  belongs_to :property_plan_jurisdiction

  validates :community_document_id,
            uniqueness: {
              scope: :property_plan_jurisdiction_id
            }
  validate :jurisdictions_must_match

  private

  def jurisdictions_must_match
    return unless community_document && property_plan_jurisdiction
    unless community_document.jurisdiction_id &&
             property_plan_jurisdiction.jurisdiction_id
      return
    end

    if community_document.jurisdiction_id !=
         property_plan_jurisdiction.jurisdiction_id
      errors.add(
        :base,
        "CommunityDocument's jurisdiction must match PropertyPlanJurisdiction's jurisdiction"
      )
    end
  end
end
