class Contact < ApplicationRecord
  searchkick searchable: %i[
               first_name
               last_name
               email
               organization
               department
               professional_association
             ],
             word_start: %i[
               first_name
               last_name
               email
               organization
               department
               professional_association
             ]

  validates :email,
            format: {
              with: URI::MailTo::EMAIL_REGEXP
            },
            allow_blank: true
  validates :phone, phone: true, allow_blank: true
  validates :cell, phone: true, allow_blank: true
  before_validation :normalize_phone

  belongs_to :contactable, polymorphic: true

  def normalize_phone
    self.phone = Phonelib.parse(phone).e164
  end

  def name
    "#{first_name} #{last_name}"
  end

  def search_data
    {
      first_name: first_name,
      last_name: last_name,
      email: email,
      organization: organization,
      department: department,
      professional_association: professional_association,
      contactable_id: contactable_id,
      created_at: created_at
    }
  end
end
