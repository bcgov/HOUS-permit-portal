class Contact < ApplicationRecord
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone_number, phone: true
  before_validation :normalize_phone_number

  belongs_to :jurisdiction

  def normalize_phone_number
    self.phone_number = Phonelib.parse(phone_number).e164
  end
end
