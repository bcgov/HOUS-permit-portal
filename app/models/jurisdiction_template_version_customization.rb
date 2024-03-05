class JurisdictionTemplateVersionCustomization < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :template_version

  validates_uniqueness_of :template_version_id, scope: :jurisdiction_id

  #   TODO: add tip html sanitization
end
