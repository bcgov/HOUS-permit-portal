class EarlyAccessRequirementTemplate < RequirementTemplate
  # has_one :template_version, dependent: :destroy, foreign_key: :requirement_template_id

  before_validation :ensure_one_published_template_version

  validate :has_one_published_template_version

  private

  def ensure_one_published_template_version
    return if published_template_version.present?

    template_versions.build(status: :published, version_date: Date.today) if new_record?
  end

  def has_one_published_template_version
    unless template_versions.length == 1 && template_versions.first.published?
      errors.add(
        :template_versions,
        I18n.t(
          "activerecord.errors.models.requirement_template.attributes.template_versions.published_required_for_early_access",
        ),
      )
    end
  end
end
