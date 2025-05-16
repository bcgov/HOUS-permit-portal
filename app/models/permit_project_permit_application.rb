class PermitProjectPermitApplication < ApplicationRecord
  belongs_to :permit_application
  belongs_to :permit_project

  # Validations, scopes, methods, etc. can be added here

  # This validation works at the model level, complementing the DB unique index.
  # It ensures that for a given permit_project_id, only one record can have is_primary = true.
  validates :permit_application_id,
            uniqueness: {
              scope: :permit_project_id,
              message: "already has a primary permit application"
            },
            if: :is_primary?

  scope :primary, -> { where(is_primary: true) }
  scope :supplemental, -> { where(is_primary: false) }
end
