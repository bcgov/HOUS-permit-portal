class EarlyAccessRequirementTemplate < RequirementTemplate
  SEARCH_INCLUDES = RequirementTemplate::SEARCH_INCLUDES + [:assignee]

  has_one :template_version,
          dependent: :destroy,
          foreign_key: :requirement_template_id

  belongs_to :assignee, class_name: "User", optional: true

  after_save :publish_early_access_version

  def publish_early_access_version
    TemplateVersioningService.publish_early_access_version!(self)
  rescue TemplateVersionPublishError => e
    errors.add(:base, e.message)
    raise ActiveRecord::Rollback
  end

  def visibility
    "early_access"
  end

  private

  def has_one_published_template_version
    unless template_versions.length == 1 && template_versions.first.published?
      errors.add(
        :template_versions,
        I18n.t(
          "activerecord.errors.models.requirement_template.attributes.template_versions.published_required_for_early_access"
        )
      )
    end
  end
end
