class EarlyAccessRequirementTemplate < RequirementTemplate
  SEARCH_INCLUDES = RequirementTemplate::SEARCH_INCLUDES + [:assignee]

  belongs_to :assignee, class_name: "User", optional: true

  after_save :maintain_published_early_access_version

  validate :valid_template_version_status

  def maintain_published_early_access_version
    TemplateVersioningService.create_or_update_published_version_for_early_access!(
      self
    )
  rescue TemplateVersionPublishError => e
    errors.add(:base, e.message)
    raise ActiveRecord::Rollback
  end

  def visibility
    "early_access"
  end

  private

  def valid_template_version_status
    return if template_versions.empty?

    if template_versions.size != 1 ||
         template_versions.first.status != "published"
      errors.add(
        :template_versions,
        I18n.t(
          "activerecord.errors.models.requirement_template.attributes.template_versions.published_required_for_early_access"
        )
      )
    end
  end
end
