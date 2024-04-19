class ExternalApiKey < ApplicationRecord
  scope :active, -> { where("expired_at IS NULL OR expired_at > ?", Time.now).where(revoked_at: nil) }
  # Token namespace can be useful for secrets scanning tools, e.g. GitHub secret scanning
  # https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partner-program
  TOKEN_NAMESPACE = "bphh"

  belongs_to :jurisdiction

  validates :token, uniqueness: true
  validates :name, presence: true, uniqueness: true

  before_create :generate_token

  encrypts :token, deterministic: true

  def expired?
    expired_at.present? && expired_at < Time.now
  end

  def revoked?
    # any non nil revoked_at value should be considered as immediately revoked
    # timestamp is just for logging purposes
    revoked_at.present?
  end

  def revoke
    update(revoked_at: Time.now)
  end

  private

  def generate_token
    self.token = "#{TOKEN_NAMESPACE}_#{SecureRandom.urlsafe_base64(64)}"
  end
end
