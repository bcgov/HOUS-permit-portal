class PermitProjectPaymentDetail < ApplicationRecord
  belongs_to :permit_project
  belongs_to :payment_detail

  # Validations, scopes, methods, etc. can be added here
end
