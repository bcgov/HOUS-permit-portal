class Sandbox < ApplicationRecord
  belongs_to :jurisdiction

  has_many :permit_applications, dependent: :destroy
  has_many :jurisdiction_template_version_customizations, dependent: :destroy

  enum template_version_status_scope: {
         published: 0,
         scheduled: 1
       },
       _default: 0

  validates :name, presence: true, uniqueness: { scope: :jurisdiction_id }

  def customizations
    # Convenience method to prevent carpal tunnel syndrome
    jurisdiction_template_version_customizations
  end

  private
end
