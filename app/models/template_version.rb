class TemplateVersion < ApplicationRecord
  include TraverseDataJson
  belongs_to :requirement_template
  belongs_to :deprecated_by, class_name: "User", optional: true

  has_many :jurisdiction_template_version_customizations
  has_many :permit_applications

  delegate :permit_type, to: :requirement_template
  delegate :activity, to: :requirement_template
  delegate :label, to: :requirement_template

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
      "action" => "#{label} - #{I18n.t("notification.template_version.new_version_notification")}",
      # TODO - include diff data
      "href" => "/digital-building-permits/#{id}/edit",
    }
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
