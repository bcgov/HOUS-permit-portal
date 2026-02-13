# DEPRECATED: This STI subclass is retained only because existing database records
# reference type = 'EarlyAccessRequirementTemplate'. New templates should use
# LiveRequirementTemplate with draft TemplateVersions instead.
#
# This class will be removed in a future migration that updates existing records.
class EarlyAccessRequirementTemplate < RequirementTemplate
  SEARCH_INCLUDES = RequirementTemplate::SEARCH_INCLUDES

  has_many :template_version_previews, through: :template_versions

  def visibility
    "early_access"
  end
end
