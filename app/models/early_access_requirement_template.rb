class EarlyAccessRequirementTemplate < RequirementTemplate
  SEARCH_INCLUDES =
    RequirementTemplate::SEARCH_INCLUDES + %i[assignee early_access_previews]

  belongs_to :assignee, class_name: "User", optional: true

  has_many :early_access_previews, dependent: :destroy
  has_many :previewers, through: :early_access_previews, source: :previewer

  before_validation :maintain_published_early_access_version,
                    unless: :maintaining_published_version?

  has_one :small_scale_site_configuration,
          class_name: "SiteConfiguration",
          foreign_key: "small_scale_requirement_template_id",
          dependent: :nullify

  # In the future, add new landing page templates like so:
  # has_one :medium_scale_site_configuration,
  #         class_name: "SiteConfiguration",
  #         foreign_key: "medium_scale_requirement_template_id",
  #         dependent: :nullify

  # has_one :large_scale_site_configuration,
  #         class_name: "SiteConfiguration",
  #         foreign_key: "large_scale_requirement_template_id",
  #         dependent: :nullify

  validate :valid_template_version_status

  validate :public_cannot_be_false_if_any_site_configuration_exists

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

  def public_cannot_be_false_if_any_site_configuration_exists
    if !public && site_configuration_present?
      errors.add(
        :public,
        "cannot be set to false because a site configuration is set to use this template on the landing page."
      )
    end
  end

  def site_configuration_present?
    small_scale_site_configuration.present?
    # In the future, add new landing page templates like so:
    # || medium_scale_site_configuration.present? ||
    #   large_scale_site_configuration.present?
  end

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
