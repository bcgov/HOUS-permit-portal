class ExternalApiKey < ApplicationRecord
  include ValidateUrlAttributes

  has_many :integration_mapping_notifications,
           as: :notifiable,
           dependent: :destroy
  has_many :api_key_expiration_notifications, dependent: :destroy

  url_validatable :webhook_url

  scope :active,
        -> do
          joins(:jurisdiction).where(
            "jurisdictions.external_api_state = ? AND (expired_at IS NULL OR expired_at > ?) AND revoked_at IS NULL",
            "j_on",
            Time.current
          )
        end
  scope :expiring_soon,
        ->(time_frame = 24.hours) do
          where(revoked_at: nil).where(
            "expired_at BETWEEN ? AND ?",
            Time.current,
            Time.current + time_frame
          )
        end

  belongs_to :jurisdiction
  belongs_to :sandbox, optional: true

  validates :token, uniqueness: true
  validates :name, presence: true, uniqueness: { scope: :jurisdiction_id }
  validates :connecting_application, presence: true
  validates :expired_at, presence: true
  validates :notification_email,
            format: {
              with: URI::MailTo::EMAIL_REGEXP
            },
            allow_blank: true

  before_create :generate_token
  after_update :send_revocation_notification_if_revoked,
               if: :saved_change_to_revoked_at?
  after_update :clear_expiration_notifications_if_expiry_changed,
               if: :saved_change_to_expired_at?

  encrypts :token, deterministic: true

  def status_scope
    sandbox&.template_version_status_scope
  end

  def email
    notification_email
  end

  def expired?
    expired_at.present? && expired_at < Time.now
  end

  def revoked?
    # any non nil revoked_at value should be considered as immediately revoked
    # timestamp is just for logging purposes
    revoked_at.present?
  end

  def enabled?
    jurisdiction.external_api_enabled? && !expired? && !revoked?
  end

  def revoke
    update(revoked_at: Time.now)
  end

  def token_namespace
    # Token namespace can be useful for secrets scanning tools, e.g. GitHub secret scanning
    # https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partner-program
    return "live" unless sandbox.present?

    "sb_#{sandbox.template_version_status_scope}"
  end

  private

  def clear_expiration_notifications_if_expiry_changed
    # If expired_at date is modified, clear out any previously sent notifications
    # as they are no longer relevant to the new expiration date.
    api_key_expiration_notifications.destroy_all
  end

  def send_revocation_notification_if_revoked
    # Send notification only if it was just revoked (revoked_at changed from nil)
    # and a notification email is present.
    # Pass nil for interval_days for revocation emails
    if revoked_at.present? && revoked_at_before_last_save.nil? &&
         notification_email.present?
      PermitHubMailer.notify_api_key_status_change(
        self,
        :revoked,
        nil
      ).deliver_later
    end
  end

  def valid_url_format
    if url.blank? || URI.parse(url).is_a?(URI::HTTP) ||
         URI.parse(url).is_a?(URI::HTTPS)
      return
    end
    errors.add(:url, "must be a valid URL")
  rescue URI::InvalidURIError
    errors.add(:url, "must be a valid URL")
  end

  def generate_token
    self.token = "#{token_namespace}_#{SecureRandom.urlsafe_base64(64)}"
  end
end
