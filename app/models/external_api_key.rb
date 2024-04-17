class ExternalApiKey < ApplicationRecord
  # Token namespace can be useful for secrets scanning tools, e.g. GitHub secret scanning
  # https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partner-program
  TOKEN_NAMESPACE = "bphh"

  belongs_to :jurisdiction

  validates :token, uniqueness: true
  validates :name, presence: true, uniqueness: true

  before_create :generate_token

  encrypts :token, deterministic: true

  private

  def generate_token
    self.token = "#{TOKEN_NAMESPACE}_#{SecureRandom.urlsafe_base64(64)}"
  end
end
