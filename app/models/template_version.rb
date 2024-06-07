class TemplateVersion < ApplicationRecord
  include TraverseDataJson
  belongs_to :requirement_template
  belongs_to :deprecated_by, class_name: "User", optional: true

  has_many :jurisdiction_template_version_customizations
  has_many :permit_applications
  has_many :submitters, through: :permit_applications

  delegate :permit_type, to: :requirement_template
  delegate :activity, to: :requirement_template
  delegate :label, to: :requirement_template
  delegate :published_template_version, to: :requirement_template

  enum status: { scheduled: 0, published: 1, deprecated: 2 }, _default: 0
  enum deprecation_reason: { new_publish: 0, unscheduled: 1 }, _prefix: true

  validates :deprecation_reason, presence: true, if: :deprecated?
  validates :deprecated_by, presence: true, if: :deprecation_reason_unscheduled?

  before_validation :set_default_deprecation_reason

  after_save :reindex_requirement_template_if_published, if: :status_changed?

  def label
    "#{permit_type.name} #{activity.name} (#{version_date.to_s})"
  end

  def lookup_props
    # form_json starts at root template
    flatten_requirements_from_form_hash(form_json)
  end

  def form_json_requirements
    json_requirements = []
    requirement_blocks_json.each_pair do |block_id, block_json|
      block_json["requirements"].each do |requirement|
        dup_requirement = requirement.dup

        dup_requirement["requirement_block_id"] = block_id

        json_requirements.push(dup_requirement)
      end
    end

    json_requirements
  end

  def publish_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::NEW_TEMPLATE_VERSION_PUBLISH,
      "action_text" => "#{label} - #{I18n.t("notification.template_version.new_version_notification")}",
      "object_data" => {
        "template_version_id" => id,
        "previous_template_version_id" => previous_version.id,
        "requirement_template_id" => requirement_template_id,
      },
    }
  end

  def previous_version
    TemplateVersioningService.previous_published_version(self)
  end

  def latest_version
    TemplateVersioningService.latest_published_version(self)
  end

  def compare_requirements(before_version)
    TemplateVersioningService.produce_diff_hash(before_version, self)
  end

  private

  def set_default_deprecation_reason
    return unless deprecated? && deprecation_reason.nil?

    self.deprecation_reason = "new_publish"
  end

  def reindex_requirement_template_if_published
    reindex_requirement_template if published?
  end

  def reindex_requirement_template
    requirement_template.reindex
  end
end
