class ExternalApiKey < ApplicationRecord
  belongs_to :jurisdiction

  validates :token, uniqueness: true
  validates :name, presence: true, uniqueness: true

  before_create :generate_token

  encrypts :token, deterministic: true

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(64)
  end
end
