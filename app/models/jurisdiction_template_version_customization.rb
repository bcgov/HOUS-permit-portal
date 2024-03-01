class JurisdictionTemplateVersionCustomization < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :template_version
end
