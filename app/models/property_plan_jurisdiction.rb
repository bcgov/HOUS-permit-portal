class PropertyPlanJurisdiction < ApplicationRecord
  belongs_to :jurisdiction
  has_many :jurisdiction_document_property_plan_jurisdictions,
           dependent: :destroy
  has_many :jurisdiction_documents,
           through: :jurisdiction_document_property_plan_jurisdictions

  has_many :permit_projects # If PPLJ_Id in PermitProject is FK to this table's PK

  # Validations, scopes, methods, etc. can be added here
end
