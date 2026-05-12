class TemplateVersionPreview < ApplicationRecord
  include Discard::Model

  belongs_to :template_version
  belongs_to :previewer, class_name: "User"

  before_validation :set_expires_at

  validates :previewer_id, presence: true
  validates :template_version_id, presence: true
  validates :expires_at, presence: true

  def frontend_url
    FrontendUrlHelper.frontend_url(
      "template-versions/#{template_version.id}/preview"
    )
  end

  def extend_access
    self.expires_at = Time.current + expiration_duration
    save
  end

  def expired?
    expires_at < Time.current
  end

  private

  def set_expires_at
    self.expires_at ||= (created_at || Time.current) + expiration_duration
  end

  def expiration_duration
    (ENV["EARLY_ACCESS_EXPIRATION_DAYS"] || 60).to_i.days
  end
end
