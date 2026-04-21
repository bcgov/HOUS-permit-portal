# DEPRECATED: This STI subclass is retained only because existing database records
# reference type = 'EarlyAccessRequirementTemplate'. New templates should use
# LiveRequirementTemplate with draft TemplateVersions instead.
#
# This class will be removed in a future migration that updates existing records.
class EarlyAccessRequirementTemplate < RequirementTemplate
  SEARCH_INCLUDES = RequirementTemplate::SEARCH_INCLUDES

  has_many :template_version_previews, through: :template_versions

  # No dedicated policy ships for this deprecated STI subclass; fall back to the
  # parent policy so Pundit lookups (e.g. via apply_search_authorization) don't
  # raise Pundit::NotDefinedError for legacy rows still in the DB.
  def self.policy_class
    RequirementTemplatePolicy
  end

  def visibility
    "early_access"
  end
end
