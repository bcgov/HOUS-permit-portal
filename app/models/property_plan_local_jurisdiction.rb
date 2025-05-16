class PropertyPlanLocalJurisdiction < ApplicationRecord
  belongs_to :jurisdiction

  has_one :permit_project # If PPLJ_Id in PermitProject is FK to this table's PK

  # Validations, scopes, methods, etc. can be added here
end
