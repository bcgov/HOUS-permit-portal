class PaymentDetail < ApplicationRecord
  has_one :permit_project_payment_detail, dependent: :destroy
  has_one :permit_project, through: :permit_project_payment_detail
  has_many :payment_detail_transactions, dependent: :destroy

  # Validations, scopes, methods, etc. can be added here
end
