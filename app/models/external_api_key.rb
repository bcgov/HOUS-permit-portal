class ExternalApiKey < ApplicationRecord
  belongs_to :jurisdiction

  validates :api_key, uniqueness: true
  validates :name, presence: true, uniqueness: true

  before_create :generate_api_key

  encrypts :api_key, deterministic: true

  private

  def generate_api_key
    self.api_key ||= SecureRandom.urlsafe_base64(64)
  end
end
