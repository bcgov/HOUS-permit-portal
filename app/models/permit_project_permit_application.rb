class PermitProjectPermitApplication < ApplicationRecord
  belongs_to :permit_application
  belongs_to :permit_project

  # Validations, scopes, methods, etc. can be added here
end
