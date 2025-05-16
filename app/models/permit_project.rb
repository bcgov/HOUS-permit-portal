class PermitProject < ApplicationRecord
  has_many :permit_project_permit_applications, dependent: :destroy
  has_many :permit_applications, through: :permit_project_permit_applications

  belongs_to :property_plan_local_jurisdiction, optional: true # Assuming PPLJ_Id is FK in PermitProject
  has_one :permit_project_payment_detail, dependent: :destroy
  has_one :payment_detail, through: :permit_project_payment_detail

  # Validations, scopes, methods, etc. can be added here
end
