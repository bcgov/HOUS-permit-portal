class PermitTypeSubmissionContact < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :permit_type

  before_create :generate_confirmation_token
  before_update :reset_confirmation, if: :email_changed?
  after_commit :send_confirmation_instructions, on: %i[create update]
  after_commit :reindex_jurisdiction, on: %i[create update]
  after_destroy :reindex_jurisdiction

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
    PermitHubMailer.permit_type_submission_contact_confirm(self).deliver_later
  end

  def reset_confirmation
    self.confirmed_at = nil
  end

  def reindex_jurisdiction
    jurisdiction.reindex
  end
end
