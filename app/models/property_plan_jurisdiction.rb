class PropertyPlanJurisdiction < ApplicationRecord
  belongs_to :jurisdiction
  has_many :community_document_property_plan_jurisdictions, dependent: :destroy
  has_many :community_documents,
           through: :community_document_property_plan_jurisdictions

  has_many :permit_projects # If PPLJ_Id in PermitProject is FK to this table's PK

  # Validations, scopes, methods, etc. can be added here
end
