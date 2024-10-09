class EarlyAccessRequirementTemplate < RequirementTemplate
  # has_one :template_version, dependent: :destroy, foreign_key: :requirement_template_id

  validate :has_one_published_template_version
  after_initialize :ensure_one_published_template_version

  private

  def ensure_one_published_template_version
    return if published_template_version.present?

    build_template_version(status: :published, version_date: Date.today) if new_record?
  end

  def has_one_published_template_version
    unless published_template_version.present?
      errors.add(
        :template_versions,
        I18n.t("activerecord.errors.models.requirement_template.published_required_for_early_access"),
      )
    end
  end
end
