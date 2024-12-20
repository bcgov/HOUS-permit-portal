class EarlyAccessPreview < ApplicationRecord
  include Discard::Model
  belongs_to :early_access_requirement_template
  belongs_to :previewer, class_name: "User"

  # Ensure expires_at is set before validation
  before_validation :set_expires_at

  validates :early_access_requirement_template_id, presence: true
  validates :previewer_id, presence: true
  validates :expires_at, presence: true
  delegate :frontend_url, to: :early_access_requirement_template

  def extend_access
    self.expires_at =
      Time.current + (ENV["EARLY_ACCESS_EXPIRATION_DAYS"] || 60).to_i.days
    save
  end

  private

  # Set expires_at to created_at + 60 days if it is not already set
  def set_expires_at
    self.expires_at ||=
      (created_at || Time.current) +
        (ENV["EARLY_ACCESS_EXPIRATION_DAYS"] || 60).to_i.days
  end
end
