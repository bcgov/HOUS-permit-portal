class Contact < ApplicationRecord
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone_number, format: { with: /\A\+\d{1,3}\s?\d{1,14}\z/ }

  belongs_to :local_jurisdiction
end
