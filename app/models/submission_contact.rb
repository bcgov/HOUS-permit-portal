class SubmissionContact < ApplicationRecord
  belongs_to :jurisdiction

  before_destroy :ensure_enabled_feature_remains_configured

  validates :email,
            presence: true,
            uniqueness: {
              scope: %i[jurisdiction_id type]
            }

  scope :confirmed, -> { where.not(confirmed_at: nil) }

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

  def feature_enabled_attribute
    raise NotImplementedError,
          "#{self.class} must implement #feature_enabled_attribute"
  end

  private

  def ensure_enabled_feature_remains_configured
    return if destroyed_by_association.present?
    return unless confirmed?
    return unless associated_feature_enabled?
    return if another_confirmed_contact_exists?

    errors.add(
      :base,
      I18n.t(
        "activerecord.errors.models.submission_contact.last_confirmed_contact",
        feature: confirmation_heading.downcase
      )
    )
    throw(:abort)
  end

  def associated_feature_enabled?
    jurisdiction&.public_send(feature_enabled_attribute)
  end

  def another_confirmed_contact_exists?
    self
      .class
      .confirmed
      .where(jurisdiction_id: jurisdiction_id)
      .where.not(id: id)
      .exists?
  end
end
