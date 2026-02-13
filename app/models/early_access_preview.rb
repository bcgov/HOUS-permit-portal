class EarlyAccessPreview < ApplicationRecord
  # The table was renamed from early_access_previews to template_version_previews
  self.table_name = "template_version_previews"

  include Discard::Model

  belongs_to :template_version
  belongs_to :previewer, class_name: "User"

  # Ensure expires_at is set before validation
  before_validation :set_expires_at

  validates :previewer_id, presence: true
  validates :expires_at, presence: true

  def frontend_url
    if template_version.present?
      FrontendUrlHelper.frontend_url(
        "template-versions/#{template_version.id}/preview"
      )
    end
  end

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
