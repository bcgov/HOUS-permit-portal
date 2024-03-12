class PermitTypeSubmissionContact < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :permit_type

  before_create :generate_confirmation_token
  before_update :reset_confirmation, if: :email_changed?
  after_commit :send_confirmation_instructions, on: %i[create update]

  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }

  def self.confirm_by_token!(confirmation_token)
    confirmable = find_by(confirmation_token:)
    confirmable.confirm!
  end

  def confirm!
    update!(confirmed_at: Time.now.utc)
  end

  def confirmed?
    !!confirmed_at
  end

  private

  def generate_confirmation_token
    self.confirmation_token = Devise.friendly_token
    self.confirmation_sent_at = Time.now.utc
  end

  def send_confirmation_instructions
    return if confirmed?
    PermitTypeSubmissionContactMailer.new.send_confirm_email(self)
  end

  def reset_confirmation
    self.confirmed_at = nil
  end
end
