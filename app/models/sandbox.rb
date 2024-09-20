class Sandbox < ApplicationRecord
  belongs_to :jurisdiction

  has_many :permit_applications, dependent: :destroy
  has_many :jurisdiction_template_version_customizations, dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :jurisdiction_id }

  private
end
