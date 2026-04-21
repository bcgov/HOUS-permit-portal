class Sandbox < ApplicationRecord
  belongs_to :jurisdiction

  has_many :permit_applications, dependent: :destroy
  has_many :jurisdiction_template_version_customizations, dependent: :destroy

  enum :template_version_status_scope,
       { published: 0, scheduled: 1 },
       default: 0

  validates :template_version_status_scope,
            uniqueness: {
              scope: :jurisdiction_id
            }

  def name
    I18n.t(
      "activerecord.attributes.sandbox.scope_names.#{template_version_status_scope}"
    )
  end

  def customizations
    # Convenience method to prevent carpal tunnel syndrome
    jurisdiction_template_version_customizations
  end

  private
end
