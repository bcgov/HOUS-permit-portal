class SubmissionContact < ApplicationRecord
  belongs_to :jurisdiction

  validates :email,
            presence: true,
            uniqueness: {
              scope: %i[jurisdiction_id type]
            }

  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :default_contact, -> { where(default: true) }

  after_commit :send_confirmation, on: :create, unless: :confirmed?

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

  def confirmation_subject_key
    raise NotImplementedError,
          "#{self.class} must implement #confirmation_subject_key"
  end

  def confirmation_heading
    raise NotImplementedError,
          "#{self.class} must implement #confirmation_heading"
  end

  def confirmation_configured_feature
    raise NotImplementedError,
          "#{self.class} must implement #confirmation_configured_feature"
  end
end
