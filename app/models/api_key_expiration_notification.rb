class ApiKeyExpirationNotification < ApplicationRecord
  belongs_to :external_api_key

  validates :external_api_key_id,
            uniqueness: {
              scope: :notification_interval_days,
              message: "notification for this interval has already been sent"
            }
  validates :notification_interval_days, presence: true
  validates :sent_at, presence: true
end
