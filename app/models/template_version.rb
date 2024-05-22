class TemplateVersion < ApplicationRecord
  include TraverseDataJson
  belongs_to :requirement_template
  has_many :jurisdiction_template_version_customizations
  has_many :permit_applications

  delegate :permit_type, to: :requirement_template
  delegate :activity, to: :requirement_template
  delegate :label, to: :requirement_template
  delegate :published_template_version, to: :requirement_template

  enum status: { scheduled: 0, published: 1, deprecated: 2 }, _default: 0

  after_save :reindex_requirement_template_if_published, if: :status_changed?

  def lookup_props
    #form_json starts at root template
    flatten_requirements_from_form_hash(form_json)
  end

  def publish_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::NEW_TEMPLATE_VERSION_PUBLISH,
      "action_text" => "#{label} - #{I18n.t("notification.template_version.new_version_notification")}",
      "object_data" => {
        "template_version_id" => id,
      },
    }
  end

  def previous_version
    requirement_template
      .template_versions
      .where("version_date <=?", version_date)
      .where.not(id: id)
      .order(version_date: :desc, created_at: :desc)
      .first
  end

  def compare_requirements(before_version)
    TemplateVersioningService.produce_diff_hash(before_version, self)
  end

  private

  def reindex_requirement_template_if_published
    reindex_requirement_template if published?
  end
  def reindex_requirement_template
    requirement_template.reindex
  end
end
