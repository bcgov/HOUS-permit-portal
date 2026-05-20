class SubmissionContact < ApplicationRecord
  belongs_to :jurisdiction

  validates :email, presence: true, uniqueness: { scope: :jurisdiction_id }
  validate :only_one_default_per_jurisdiction

  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :default_contact, -> { where(default: true) }

  def confirmed?
    confirmed_at.present?
  end

  def send_confirmation
    self.confirmation_token = SecureRandom.hex(20)
    self.confirmation_sent_at = Time.current
    save!
    PermitHubMailer.submission_contact_confirm(self).deliver_later
  end

  def confirm!
    update!(confirmed_at: Time.current, confirmation_token: nil)
  end

  private

  def only_one_default_per_jurisdiction
    return unless default?

    existing_default =
      SubmissionContact
        .where(jurisdiction_id: jurisdiction_id, default: true)
        .where.not(id: id)

    if existing_default.exists?
      errors.add(
        :default,
        "another default contact already exists for this jurisdiction"
      )
    end
  end
end
