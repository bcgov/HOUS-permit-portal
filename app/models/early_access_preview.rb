class EarlyAccessPreview < ApplicationRecord
  belongs_to :early_access_requirement_template
  belongs_to :previewer, class_name: "User"

  # Ensure expires_at is set before validation
  before_validation :set_expires_at, on: :create

  validates :early_access_requirement_template_id, presence: true
  validates :previewer_id, presence: true
  validates :expires_at, presence: true
  delegate :frontend_url, to: :early_access_requirement_template

  private

  # Set expires_at to created_at + 60 days if it is not already set
  def set_expires_at
    duration_days = (ENV["EARLY_ACCESS_EXPIRATION_DAYS"] || 60).to_i
    self.expires_at ||=
      (
        if created_at
          created_at + duration_days.days
        else
          Time.current + duration_days.days
        end
      )
  end
end
