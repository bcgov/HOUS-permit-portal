class EarlyAccessRequirementTemplate < RequirementTemplate
  SEARCH_INCLUDES =
    RequirementTemplate::SEARCH_INCLUDES + %i[assignee early_access_previews]

  belongs_to :assignee, class_name: "User", optional: true

  has_many :early_access_previews, dependent: :destroy
  has_many :previewers, through: :early_access_previews, source: :previewer

  before_validation :maintain_published_early_access_version,
                    unless: :maintaining_published_version?

  validate :valid_template_version_status

  def frontend_url
    FrontendUrlHelper.frontend_url("early-access/requirement-templates/#{id}")
  end

  def maintain_published_early_access_version
    return if @maintaining_published_version

    @maintaining_published_version = true
    TemplateVersioningService.create_or_update_published_version_for_early_access!(
      self
    )
  rescue TemplateVersionPublishError => e
    errors.add(:base, e.message)
    raise ActiveRecord::Rollback
  ensure
    @maintaining_published_version = false
  end

  def visibility
    "early_access"
  end

  private

  # Predicate method for callback condition
  def maintaining_published_version?
    @maintaining_published_version
  end

  def valid_template_version_status
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
