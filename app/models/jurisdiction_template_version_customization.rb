class JurisdictionTemplateVersionCustomization < ApplicationRecord
  # The expected schema of the :customizations json is the following
  # {
  #   requirement_block_changes?: Record<UUID, {
  #     tip?: string
  #     enabled_elective_field_ids?: Array<UUID>
  #   }>
  # }
  # Where the key to requirement_block_changes object is the id of the requirement_block affected.
  # Where the elective_fields are the ids of the requirement_fields that are elective and have been
  # enabled
  belongs_to :jurisdiction
  belongs_to :template_version

  before_save :sanitize_tip
  # Ensure that for each jurisdiction and template_version, there is at most one sandboxed and one non-sandboxed customization
  validates :sandboxed,
            uniqueness: {
              scope: %i[jurisdiction_id template_version_id],
              message:
                I18n.t("activerecord.errors.models.jurisdiction_template_version_customizations.sandboxed_uniqueness"),
            }
  after_commit :reindex_jurisdiction_templates_used_size
  after_commit :publish_customization_event, on: %i[update]

  validate :ensure_reason_set_for_enabled_elective_fields

  scope :sandboxed, -> { unscoped.where(sandboxed: true) }

  # Setting default_scope to filter non-sandboxed records by default
  default_scope { where(sandboxed: false) }

  ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS = %w[bylaw policy zoning].freeze

  def elective_enabled?(requirement_block_id, requirement_id)
    return false if customizations.blank? || customizations["requirement_block_changes"].blank?

    !!customizations.dig("requirement_block_changes", requirement_block_id, "enabled_elective_field_ids")&.include?(
      requirement_id,
    )
  end

  def update_event_notification_data
    {
      "id" => SecureRandom.uuid,
      "action_type" => Constants::NotificationActionTypes::CUSTOMIZATION_UPDATE,
      "action_text" =>
        "#{I18n.t("notification.template_version.new_customization_notification", jurisdiction_name: jurisdiction.qualified_name, template_label: template_version.label)}",
      "object_data" => {
        "template_version_id" => template_version.id,
        "customizations" => customizations,
      },
    }
  end

  def label
    "#{jurisdiction.name} #{template_version.label}"
  end

  def self.requirement_count_by_reason(requirement_block_id, requirement_id, reason)
    return 0 unless ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.include?(reason)

    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_block_id -> 'enabled_elective_field_ids' @> :id",
        requirement_block_id: requirement_block_id,
        id: "[\"#{requirement_id}\"]",
      )
      .select do |jtvc|
        jtvc
          .customizations
          .dig("requirement_block_changes", requirement_block_id, "enabled_elective_field_reasons")
          &.values
          &.include?(reason)
      end
      .count
  end

  def self.count_of_jurisdictions_using_requirement(requirement_block_id, requirement_id)
    JurisdictionTemplateVersionCustomization
      .joins(:template_version)
      .where(template_versions: { status: "published" })
      .where(
        "customizations -> 'requirement_block_changes' -> :requirement_block_id -> 'enabled_elective_field_ids' @> :id",
        requirement_block_id: requirement_block_id,
        id: "[\"#{requirement_id}\"]",
      )
      .count
  end

  private

  def reindex_jurisdiction_templates_used_size
    return unless jurisdiction.present?
    return unless new_record? || destroyed? || saved_change_to_jurisdiction_id?

    jurisdiction.reindex
  end

  def sanitize_tip
    return if customizations.blank? || customizations["requirement_block_changes"].blank?

    customizations["requirement_block_changes"].each do |key, value|
      next if value["tip"].blank?
      customizations["requirement_block_changes"][key]["tip"] = ActionController::Base.helpers.sanitize(value["tip"])
    end
  end

  def ensure_reason_set_for_enabled_elective_fields
    return if customizations.blank? || customizations["requirement_block_changes"].blank?

    customizations["requirement_block_changes"].each do |_key, value|
      next if value["enabled_elective_field_ids"].blank?

      any_missing_or_incorrect_reason =
        value["enabled_elective_field_ids"].any? do |field_id|
          return true if value["enabled_elective_field_reasons"].blank?

          value["enabled_elective_field_reasons"][field_id].blank? ||
            ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.none? do |reason|
              reason == value["enabled_elective_field_reasons"][field_id]
            end
        end

      if any_missing_or_incorrect_reason
        errors.add(
          :customizations,
          I18n.t(
            "model_validation.jurisdiction_template_version_customization.enabled_elective_field_reason_incorrect",
            accepted_reasons: ACCEPTED_ENABLED_ELECTIVE_FIELD_REASONS.join(", "),
          ),
        )
      end
    end
  end

  def publish_customization_event
    NotificationService.publish_customization_update_event(self)
  end
end
